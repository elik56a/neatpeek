/**
 * Design Review Service
 *
 * This service coordinates between the Figma and AI services to provide
 * a complete design review workflow.
 *
 * NOTE: This service is server-side only and should not be imported on the client.
 */

// This service is server-side only and should not be imported on the client
import { prisma } from "@/services/db/prisma";
import { storageProvider } from "@/services/storage";
import {
  DesignAnalysisInput,
  DesignAnalysisResult,
  DesignRecheckInput,
  DesignRecheckResult,
  FigmaMetadata,
  ReviewHistoryAction,
  HistoryChanges,
  BrandIssue,
  GeneralIssue,
  Design,
  DesignsReview,
  FrameMetadata,
  DesignReviewResult,
} from "../types";
import { ReviewStatus, ReviewType } from "@prisma/client";
import { FigmaService } from "./figma-service";
import { DesignRecheckService } from "./design-recheck-service";
import { AIService } from "@/services/ai/types";
import { BrandRule } from "@/features/brand-setup/types";

/**
 * Design Review Service
 */
export class DesignReviewService {
  private static instance: DesignReviewService;
  private figmaService: FigmaService | null = null;
  private recheckService: DesignRecheckService | null = null;
  private aiProvider: AIService | null = null;

  /**
   * Create a new DesignReviewService
   * @param figmaToken Optional Figma API token
   */
  private constructor(figmaToken?: string) {
    if (figmaToken) {
      this.initializeFigmaService(figmaToken);
    }
  }

  /**
   * Get the singleton instance of DesignReviewService
   * @returns DesignReviewService instance
   */
  public static getInstance(figmaToken?: string): DesignReviewService {
    if (!DesignReviewService.instance) {
      DesignReviewService.instance = new DesignReviewService(figmaToken);
    }
    return DesignReviewService.instance;
  }

  /**
   * Initialize the Figma service with a token
   * @param figmaToken Figma API token
   */
  public initializeFigmaService(figmaToken: string): void {
    this.figmaService = new FigmaService(figmaToken);
    this.recheckService = new DesignRecheckService(this.figmaService);
  }

  /**
   * Initialize the AI provider
   */
  private async initAIProvider() {
    if (!this.aiProvider) {
      const { getAIService } = await import("@/services/ai");
      this.aiProvider = await getAIService();
    }
    return this.aiProvider;
  }

  /**
   * Review a design against brand rules
   * @param input Review input with optional selectedFrameIds and userId
   * @returns DesignsReviewId
   */
  async analyzeDesigns(
    input: DesignAnalysisInput & { selectedFrameIds?: string[]; userId: string }
  ): Promise<string> {
    try {
      const { figmaUrl, brandId, userId, selectedFrameIds } = input;

      if (!figmaUrl) {
        throw new Error("Figma URL is required");
      }

      if (!userId) {
        throw new Error("User ID is required");
      }

      // Get brand rules
      const brandGuideline = await prisma.brandGuideline.findUnique({
        where: { id: brandId },
        include: {
          brandRules: true,
        },
      });

      if (!brandGuideline) {
        throw new Error("brandGuideline not found");
      }

      // Extract designs from Figma
      const figmaMetaData = await this.figmaService.extractFramesDesignsFromFigma(
        figmaUrl,
        selectedFrameIds
      );

      // Process images for AI - use filtered URLs if available
      const imageParts = await Promise.all(
        figmaMetaData.frames.map(frame => this.figmaService.urlToInlineData(frame.url))
      );

      // Initialize AI service
      const aiService = await this.initAIProvider();

      // Analyze designs
      const analysisResult = await aiService.analyzeDesigns({
        imageParts,
        metadata: figmaMetaData,
        brandRules: brandGuideline.brandRules as Partial<BrandRule>[],
      });

      // Save results to database and get review IDs
      const designsReviewId = await this.saveAnalysisResults(
        brandId,
        userId,
        figmaMetaData,
        analysisResult,
        figmaUrl
      );

      return designsReviewId;
    } catch (error) {
      console.error("Error analyzing design:", error);
      throw error;
    }
  }

  /**
   * Recheck a design against previous comments
   * @param input Recheck input
   * @returns Recheck result
   */
  async recheckDesigns(input: DesignRecheckInput): Promise<DesignRecheckResult["designsReviewId"]> {
    try {
      const { designsReviewId, brandId, userId, frameIds } = input;

      if (!userId) {
        throw new Error("User ID is required");
      }

      // Get brand guideline
      const brandGuideline = await prisma.brandGuideline.findUnique({
        where: { id: brandId },
        include: {
          brandRules: true,
        },
      });

      if (!brandGuideline) {
        throw new Error("Brand guideline not found");
      }

      const designsReview = await this.getDesignsReview(designsReviewId);

      if (!designsReview) {
        throw new Error("Design review not found");
      }

      const figmaMetaData = await this.figmaService.extractFramesDesignsFromFigma(
        designsReview.figmaUrl,
        frameIds
      );

      // Process images for AI - use filtered URLs if available
      const imageParts = await Promise.all(
        figmaMetaData.frames.map(frame => this.figmaService.urlToInlineData(frame.url))
      );
      // Initialize the AI provider
      const aiProvider = await this.initAIProvider();

      // Create comment maps and prepare data for AI
      const { commentIdToIssue } = this.recheckService.createCommentMaps(designsReview.designs);
      const commentsByFrame = await this.recheckService.prepareCommentsByFrame(
        figmaMetaData.fileKey,
        commentIdToIssue
      );

      // Recheck designs
      const recheckResult = await aiProvider.recheckDesigns({
        imageParts,
        metadata: figmaMetaData,
        brandRules: brandGuideline.brandRules as Partial<BrandRule>[],
        commentsByFrame,
      });

      console.log("Recheck result:", recheckResult);

      // // Process recheck results and update the database
      await this.recheckService.processRecheckResult(
        recheckResult,
        figmaMetaData,
        designsReview.designs
      );

      return {
        designsReviewId: designsReview.id,
      };
    } catch (error) {
      console.error("Error rechecking design:", error);
      throw error;
    }
  }

  /**
   * Save analysis results to database
   * @param brandGuidelineId Brand guideline ID
   * @param userId User ID
   * @param metadata Figma metadata
   * @param analysisResult Analysis result
   * @param originalFigmaUrl Original Figma URL
   * @returns DesignsReviewId
   */
  private async saveAnalysisResults(
    brandGuidelineId: string,
    userId: string,
    metadata: FigmaMetadata,
    analysisResult: DesignReviewResult[],
    originalFigmaUrl?: string
  ): Promise<string> {
    try {
      const { formatBrandIssueComment, formatGeneralIssueComment } = await import("../utils");
      const { generateInitialReviewSummary } = await import("../utils/history-formatters");
      const { validateDesignReviewResult } = await import("../utils/validation");

      const urlToFrameData: Record<string, Partial<FrameMetadata>> = {};
      for (const frame of metadata.frames) {
        urlToFrameData[frame.url] = {
          id: frame.id,
          position: frame.position,
        };
      }

      // Add Figma comment IDs to brand issues
      for (const review of analysisResult) {
        const frameData = urlToFrameData[review.image.url];
        if (frameData && review.brand_issues) {
          for (const issue of review.brand_issues) {
            const commentText = formatBrandIssueComment(issue);
            const commentId = await this.figmaService.addFigmaComment(
              metadata.fileKey,
              frameData.id,
              commentText,
              issue.coordinates,
              frameData.position
            );
            issue.figma_comment_id = commentId;
          }
        }

        // Add Figma comment IDs to general issues
        if (frameData && review.general_issues) {
          for (const issue of review.general_issues) {
            const commentText = formatGeneralIssueComment(issue);
            const commentId = await this.figmaService.addFigmaComment(
              metadata.fileKey,
              frameData.id,
              commentText,
              issue.coordinates,
              frameData.position
            );

            // Store the comment ID directly in the issue
            issue.figma_comment_id = commentId;
          }
        }
      }

      // Create a new DesignsReview
      const designsReview = await prisma.designsReview.create({
        data: {
          userId,
          brandGuidelineId,
          name: metadata.fileName || "Design Review",
          status: "IN_PROGRESS",
          reviewType: ReviewType.FIGMA,
          figmaUrl: originalFigmaUrl,
          figmaFileId: metadata.fileKey,
          designs: {
            create: analysisResult.map(review => ({
              userId,
              frameId: review.image.frame_id,
              reviewJson: {
                ...review,
                created_at: new Date().toISOString(),
              } as any, // Cast to any for Prisma JSON field compatibility
              status: ReviewStatus.IN_PROGRESS,
              originalFigmaUrl,
            })),
          },
        },
      });

      // Create initial history entry
      await prisma.reviewHistory.create({
        data: {
          designsReviewId: designsReview.id,
          action: ReviewHistoryAction.INITIAL_REVIEW,
          summary: generateInitialReviewSummary(
            analysisResult.flatMap(r => r.brand_issues),
            analysisResult.flatMap(r => r.general_issues)
          ),
          changes: this.createInitialReviewChanges(
            analysisResult.flatMap(r => r.brand_issues),
            analysisResult.flatMap(r => r.general_issues),
            analysisResult.reduce((sum, r) => sum + r.design_score.total, 0) / analysisResult.length
          ) as any, // Cast to any for Prisma JSON field compatibility
        },
      });

      return designsReview.id;
    } catch (error) {
      console.error("Error saving analysis results:", error);
      throw error;
    }
  }

  /**
   * Create history changes for initial review
   * @param brandIssues Array of brand issues
   * @param generalIssues Array of general issues
   * @param designScore Design score
   * @returns History changes object
   */
  private createInitialReviewChanges(
    brandIssues: BrandIssue[],
    generalIssues: GeneralIssue[],
    designScore: number
  ): HistoryChanges {
    return {
      brand_issues_count: brandIssues.length,
      general_issues_count: generalIssues.length,
      total_issues_count: brandIssues.length + generalIssues.length,
      design_score: designScore,
      // Initialize other fields with default values
      fixed_count: 0,
      partially_fixed_count: 0,
      not_fixed_count: 0,
    };
  }

  /**
   * Create a new design review
   */
  async createDesignReview(params: {
    userId: string;
    brandGuidelineId: string;
    name: string;
    description?: string;
    reviewType: ReviewType;
    figmaUrl?: string;
    figmaFileId?: string;
  }): Promise<DesignsReview> {
    return prisma.designsReview.create({
      data: {
        userId: params.userId,
        brandGuidelineId: params.brandGuidelineId,
        name: params.name,
        description: params.description,
        reviewType: params.reviewType,
        figmaUrl: params.figmaUrl,
        figmaFileId: params.figmaFileId,
        status: ReviewStatus.PENDING,
      },
      include: {
        user: true,
        brandGuideline: true,
        designs: true,
        reviewHistory: true,
      },
    });
  }

  /**
   * Upload a design file for manual review
   */
  async uploadDesignFile(params: {
    designsReviewId: string;
    userId: string;
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }): Promise<Design> {
    // Save the file
    const result = await storageProvider.saveFile({
      buffer: params.buffer,
      filename: params.filename,
      mimeType: params.mimeType,
      folder: `designs/${params.designsReviewId}`,
    });

    // Create the design record
    return prisma.design.create({
      data: {
        userId: params.userId,
        designsReviewId: params.designsReviewId,
        frameId: `manual-${Date.now()}`, // Generate a unique frame ID
        fileName: result.path, // Store the file path
        reviewJson: {}, // Will be populated by analysis
        status: ReviewStatus.PENDING,
      },
      include: {
        user: true,
        designsReview: true,
      },
    });
  }

  /**
   * Upload multiple design files for manual review
   */
  async uploadDesignFiles(params: {
    designsReviewId: string;
    userId: string;
    files: Array<{
      buffer: Buffer;
      filename: string;
      mimeType: string;
    }>;
  }): Promise<Design[]> {
    // Upload each file
    const designPromises = params.files.map(file =>
      this.uploadDesignFile({
        designsReviewId: params.designsReviewId,
        userId: params.userId,
        buffer: file.buffer,
        filename: file.filename,
        mimeType: file.mimeType,
      })
    );

    return Promise.all(designPromises);
  }

  /**
   * Get a design review by ID
   */
  async getDesignsReview(id: string): Promise<DesignsReview | null> {
    const review = await prisma.designsReview.findUnique({
      where: { id },
      include: {
        brandGuideline: true,
        designs: true,
        reviewHistory: true,
      },
    });

    return review;
  }

  /**
   * Get all designs for a review
   */
  async getDesigns(designsReviewId: string): Promise<Design[]> {
    const designs = await prisma.design.findMany({
      where: { designsReviewId },
      include: {
        user: true,
        designsReview: true,
      },
    });

    return designs;
  }

  /**
   * Delete a design review and all its files
   */
  async deleteDesignReview(id: string): Promise<void> {
    // Get the design review with all related data
    const designReview = await prisma.designsReview.findUnique({
      where: { id },
      include: {
        designs: true,
      },
    });

    if (!designReview) {
      throw new Error("Design review not found");
    }

    // Delete all design files
    for (const design of designReview.designs) {
      if (design.fileName) {
        try {
          await storageProvider.deleteFile(design.fileName);
        } catch (error) {
          console.error("Error deleting design file:", error);
        }
      }
    }

    // Delete the design review and all related data (cascading delete)
    await prisma.designsReview.delete({
      where: { id },
    });
  }

  async updateReviewStatus(
    id: string,
    status: ReviewStatus,
    feedback?: string
  ): Promise<DesignsReview> {
    const review = await prisma.designsReview.update({
      where: { id },
      data: {
        status,
        feedback,
      },
      include: {
        user: true,
        brandGuideline: true,
        designs: true,
        reviewHistory: true,
      },
    });

    return review;
  }
}
