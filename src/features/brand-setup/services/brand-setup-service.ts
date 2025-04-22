import { prisma } from '@/services/db/prisma';
import { BrandGuideline, BrandGuidelineStatus, CustomRule, ProcessingStatus } from '../types';
import { storageProvider } from '@/services/storage';

/**
 * Service for brand setup functionality
 */
export class BrandSetupService {
  private aiProvider: any = null;

  /**
   * Initialize the AI provider
   */
  private async initAIProvider() {
    if (!this.aiProvider) {
      const { getAIService } = await import('@/services/ai');
      this.aiProvider = await getAIService();
    }
    return this.aiProvider;
  }

  /**
   * Create a new brand guideline
   */
  async createBrandGuideline(params: {
    userId: string;
    name: string;
    description?: string;
    companyId?: string;
    teamId?: string;
  }): Promise<BrandGuideline> {
    return prisma.brandGuideline.create({
      data: {
        userId: params.userId,
        name: params.name,
        description: params.description,
        companyId: params.companyId,
        teamId: params.teamId,
        status: BrandGuidelineStatus.DRAFT,
        processingStatus: ProcessingStatus.PENDING,
      },
    });
  }

  /**
   * Update an existing brand guideline
   */
  async updateBrandGuideline(params: {
    id: string;
    name: string;
    description?: string;
  }): Promise<BrandGuideline> {
    return prisma.brandGuideline.update({
      where: { id: params.id },
      data: {
        name: params.name,
        description: params.description,
      },
    });
  }

  /**
   * Upload a PDF file for a brand guideline
   */
  async uploadBrandGuidelinePdf(params: {
    brandGuidelineId: string;
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }): Promise<BrandGuideline> {
    // Save the file
    const result = await storageProvider.saveFile({
      buffer: params.buffer,
      filename: params.filename,
      mimeType: params.mimeType,
      folder: `${params.brandGuidelineId}`,
    });

    // Update the brand guideline
    return prisma.brandGuideline.update({
      where: { id: params.brandGuidelineId },
      data: {
        pdfUrl: result.url,
        pdfPath: result.path,
      },
    });
  }

  /**
   * Upload a design image for a brand guideline
   */
  async uploadDesignImage(params: {
    brandGuidelineId: string;
    buffer: Buffer;
    filename: string;
    mimeType: string;
    name?: string;
    description?: string;
  }): Promise<BrandGuideline> {
    // Save the file
    const result = await storageProvider.saveFile({
      buffer: params.buffer,
      filename: params.filename,
      mimeType: params.mimeType,
      folder: `${params.brandGuidelineId}/images`,
    });

    // Create the design image record
    return prisma.designImage.create({
      data: {
        brandGuidelineId: params.brandGuidelineId,
        url: result.url,
        path: result.path,
        name: params.name,
        description: params.description,
      },
    });
  }

  /**
   * Upload multiple design images for a brand guideline
   */
  async uploadDesignImages(params: {
    brandGuidelineId: string;
    images: Array<{
      buffer: Buffer;
      filename: string;
      mimeType: string;
      name?: string;
      description?: string;
    }>;
  }): Promise<BrandGuideline> {
    // Upload each image
    const imagePromises = params.images.map((image) => this.uploadDesignImage({
      brandGuidelineId: params.brandGuidelineId,
      buffer: image.buffer,
      filename: image.filename,
      mimeType: image.mimeType,
      name: image.name,
      description: image.description,
    }));

    await Promise.all(imagePromises);

    // Return the updated brand guideline
    return prisma.brandGuideline.findUnique({
      where: { id: params.brandGuidelineId },
      include: {
        designImages: true,
      },
    });
  }

  /**
   * Add custom rules to a brand guideline
   */
  async addCustomRules(params: {
    brandGuidelineId: string;
    rules: CustomRule[];
  }): Promise<BrandGuideline> {
    // Create each custom rule
    const rulePromises = params.rules.map((rule) => {
      return prisma.customRule.create({
        data: {
          brandGuidelineId: params.brandGuidelineId,
          category: rule.category,
          name: rule.name,
          description: rule.description,
        },
      });
    });

    await Promise.all(rulePromises);

    // Return the updated brand guideline
    return prisma.brandGuideline.findUnique({
      where: { id: params.brandGuidelineId },
      include: {
        customRules: true,
      },
    });
  }

  /**
   * Start the analysis process for a brand guideline
   */
  async startAnalysis(brandGuidelineId: string): Promise<BrandGuideline> {
    // Update the brand guideline status
    const brandGuideline = await prisma.brandGuideline.update({
      where: { id: brandGuidelineId },
      data: {
        status: BrandGuidelineStatus.PROCESSING,
        processingStatus: ProcessingStatus.ANALYZING_PDF,
        processingMessage: "Analyzing brand guidelines...",
      },
      include: {
        designImages: true,
        customRules: true,
      },
    });

    // Start the analysis in the background
    this.analyzeInBackground(brandGuideline).catch((error) => {
      console.error('Error analyzing brand guideline:', error);
    });

    return brandGuideline;
  }

  /**
   * Analyze the brand guideline in the background using Vertex AI
   * This is a separate method to allow the API to return immediately
   */
  private async analyzeInBackground(brandGuideline: BrandGuideline): Promise<void> {
    try {
      // Update status to indicate we're fetching files
      await prisma.brandGuideline.update({
        where: { id: brandGuideline.id },
        data: {
          processingStatus: ProcessingStatus.FETCHING_FILES,
          processingMessage: "Fetching PDF and design images...",
        },
      });

      // Prepare the analysis parameters
      let pdfBuffer: Buffer | undefined;
      const designImages: Array<{ buffer: Buffer; mimeType: string }> = [];
      const customRules = brandGuideline.customRules || [];

      // Get the PDF file if it exists
      if (brandGuideline.pdfPath) {
        try {
          pdfBuffer = await storageProvider.getFile(brandGuideline.pdfPath);
        } catch (error) {
          console.error('Error fetching PDF file:', error);
          // Continue without the PDF
        }
      }

      // Get the design images if they exist
      if (brandGuideline.designImages && brandGuideline.designImages.length > 0) {
        for (const image of brandGuideline.designImages) {
          if (image.path) {
            try {
              const buffer = await storageProvider.getFile(image.path);
              const mimeType = this.getMimeTypeFromFilename(image.path);
              designImages.push({ buffer, mimeType });
            } catch (error) {
              console.error('Error fetching design image:', error);
              // Continue without this image
            }
          }
        }
      }

      // Update status to indicate we're analyzing
      await prisma.brandGuideline.update({
        where: { id: brandGuideline.id },
        data: {
          processingStatus: ProcessingStatus.ANALYZING_PDF,
          processingMessage: "Analyzing brand guidelines with AI...",
        },
      });

      // Initialize the AI provider
      const aiProvider = await this.initAIProvider();

      // Call the AI provider to analyze the brand guideline
      const result = await aiProvider.analyzeBrandGuideline({
        pdfBuffer,
        designImages,
        customRules: customRules.map(rule => ({
          category: rule.category,
          name: rule.name,
          description: rule.description
        })),
        brandName: brandGuideline.name,
      });

      // Extract the rules from the AI analysis result
      const rules = [];

      // Process colors
      if (result.colors && Array.isArray(result.colors)) {
        for (const color of result.colors) {
          rules.push({
            category: 'COLOR',
            name: color.name,
            value: color.value,
            description: color.description,
          });
        }
      }

      // Process typography
      if (result.typography && Array.isArray(result.typography)) {
        for (const font of result.typography) {
          rules.push({
            category: 'TYPOGRAPHY',
            name: font.name,
            value: font.value,
            description: font.description,
          });
        }
      }

      // Process spacing
      if (result.spacing && Array.isArray(result.spacing)) {
        for (const space of result.spacing) {
          rules.push({
            category: 'SPACING',
            name: space.name,
            value: space.value,
            description: space.description,
          });
        }
      }

      // Process logo
      if (result.logo && Array.isArray(result.logo)) {
        for (const logoRule of result.logo) {
          rules.push({
            category: 'LOGO',
            name: logoRule.name,
            value: logoRule.value,
            description: logoRule.description,
          });
        }
      }

      // Process icons
      if (result.icons && Array.isArray(result.icons)) {
        for (const icon of result.icons) {
          rules.push({
            category: 'ICON',
            name: icon.name,
            value: icon.value,
            description: icon.description,
          });
        }
      }

      // Process layout
      if (result.layout && Array.isArray(result.layout)) {
        for (const layoutRule of result.layout) {
          rules.push({
            category: 'LAYOUT',
            name: layoutRule.name,
            value: layoutRule.value,
            description: layoutRule.description,
          });
        }
      }

      // Process general rules
      if (result.general && Array.isArray(result.general)) {
        for (const generalRule of result.general) {
          rules.push({
            category: 'GENERAL',
            name: generalRule.name,
            value: generalRule.value,
            description: generalRule.description,
          });
        }
      }

      // Save the rules
      await this.saveBrandRules(brandGuideline.id, rules);

      // Update the brand guideline status
      await prisma.brandGuideline.update({
        where: { id: brandGuideline.id },
        data: {
          status: BrandGuidelineStatus.COMPLETED,
          processingStatus: ProcessingStatus.COMPLETED,
          processingMessage: "Analysis completed successfully.",
        },
      });
    } catch (error) {
      console.error('Failed to analyze brand guideline:', error);

      // Update the brand guideline status
      await prisma.brandGuideline.update({
        where: { id: brandGuideline.id },
        data: {
          status: BrandGuidelineStatus.FAILED,
          processingStatus: ProcessingStatus.FAILED,
          processingMessage: `Analysis failed: ${error.message || 'Unknown error'}`,
        },
      });
    }
  }

  /**
   * Get the MIME type from a filename
   */
  private getMimeTypeFromFilename(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Save brand rules to the database
   */
  private async saveBrandRules(
    brandGuidelineId: string,
    rules: Array<{
      category: string;
      name: string;
      description: string;
      value?: string;
    }>
  ): Promise<void> {
    // Delete existing rules
    await prisma.brandRule.deleteMany({
      where: { brandGuidelineId },
    });

    // Save all rules
    for (const rule of rules) {
      await prisma.brandRule.create({
        data: {
          brandGuidelineId,
          category: rule.category,
          name: rule.name,
          value: rule.value ,
          description: rule.description,
        },
      });
    }
  }

  /**
   * Get a brand guideline by ID
   */
  async getBrandGuideline(id: string): Promise<BrandGuideline | null> {
    return prisma.brandGuideline.findUnique({
      where: { id },
      include: {
        designImages: true,
        customRules: true,
        brandRules: true,
      },
    });
  }

  /**
   * Get all brand guidelines for a user
   */
  async getBrandGuidelinesForUser(userId: string, options?: { companyId?: string; teamId?: string }): Promise<BrandGuideline[]> {
    const where: any = { userId };

    // Add company and team filters if provided
    if (options?.companyId) {
      where.companyId = options.companyId;
    }

    if (options?.teamId) {
      where.teamId = options.teamId;
    }

    return prisma.brandGuideline.findMany({
      where,
      include: {
        designImages: true,
        customRules: true,
        brandRules: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all brand guidelines for a company
   */
  async getBrandGuidelinesForCompany(companyId: string): Promise<BrandGuideline[]> {
    return prisma.brandGuideline.findMany({
      where: { companyId },
      include: {
        designImages: true,
        customRules: true,
        brandRules: true,
        user: true,
        team: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all brand guidelines for a team
   */
  async getBrandGuidelinesForTeam(teamId: string): Promise<BrandGuideline[]> {
    return prisma.brandGuideline.findMany({
      where: { teamId },
      include: {
        designImages: true,
        customRules: true,
        brandRules: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete a brand guideline
   */
  async deleteBrandGuideline(id: string): Promise<void> {
    // Get the brand guideline with all related data
    const brandGuideline = await prisma.brandGuideline.findUnique({
      where: { id },
      include: {
        designImages: true,
      },
    });

    if (!brandGuideline) {
      throw new Error('Brand guideline not found');
    }

    // Delete the PDF file if it exists
    if (brandGuideline.pdfPath) {
      try {
        await storageProvider.deleteFile(brandGuideline.pdfPath);
      } catch (error) {
        console.error('Error deleting PDF file:', error);
      }
    }

    // Delete all design images
    for (const image of brandGuideline.designImages) {
      try {
        if (image.path) {
          await storageProvider.deleteFile(image.path);
        }
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }

    // Delete the brand guideline and all related data (cascading delete)
    await prisma.brandGuideline.delete({
      where: { id },
    });
  }
}
