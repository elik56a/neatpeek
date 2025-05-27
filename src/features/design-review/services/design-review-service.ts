/**
 * Design Review Service
 *
 * This service coordinates between the Figma and AI services to provide
 * a complete design review workflow.
 *
 * NOTE: This service is server-side only and should not be imported on the client.
 */

// This service is server-side only and should not be imported on the client
import { BrandRule } from "@/features/brand-setup/types";
import { AIService } from "@/services/ai/types";
import { prisma } from "@/services/db/prisma";
import { storageProvider } from "@/services/storage";
import { ReviewStatus, ReviewType } from "@prisma/client";
import {
  BrandIssue,
  Design,
  DesignAnalysisInput,
  DesignRecheckInput,
  DesignReviewResult,
  DesignsReview,
  FigmaMetadata,
  FrameMetadata,
  GeneralIssue,
  ReviewTimelineAction,
  TimelineChanges,
} from "../types";
import { DesignRecheckService } from "./design-recheck-service";
import { FigmaService } from "./figma-service";
import { formatBrandIssueComment, formatGeneralIssueComment } from "../utils";
import { generateInitialReviewSummary } from "../utils/timeline-formatters";
import { VoidFunctionComponent } from "react";

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
   * Create a design review immediately and start background processing
   * @param input Review input with optional selectedFrameIds and userId
   * @returns DesignsReviewId immediately
   */
  async createDesignReviewAndStartProcessing(
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

      // Get brand guideline to validate it exists
      const brandGuideline = await prisma.brandGuideline.findUnique({
        where: { id: brandId },
        select: { id: true, name: true },
      });

      if (!brandGuideline) {
        throw new Error("Brand guideline not found");
      }

      // Extract file key from URL for basic info
      const { fileKey } = this.figmaService.extractFigmaInfo(figmaUrl);

      // Create the design review immediately with PENDING status and default name
      const designsReview = await prisma.designsReview.create({
        data: {
          userId,
          brandGuidelineId: brandId,
          name: "Design Review", // Default name, will be updated with actual file name in background
          status: ReviewStatus.PENDING,
          reviewType: ReviewType.FIGMA,
          figmaUrl,
          figmaFileId: fileKey,
        },
      });

      // Start background processing without waiting for it
      this.processDesignReviewInBackground(designsReview.id, input).catch(error => {
        console.error("Background processing failed:", error);
        this.updateReviewStatus(designsReview.id, ReviewStatus.FAILED);
      });

      return designsReview.id;
    } catch (error) {
      console.error("Error creating design review:", error);
      throw error;
    }
  }

  /**
   * Process design review in the background
   * @param designsReviewId The ID of the design review to process
   * @param input Original input parameters
   */
  private async processDesignReviewInBackground(
    designsReviewId: string,
    input: DesignAnalysisInput & { selectedFrameIds?: string[]; userId: string }
  ): Promise<void> {
    try {
      const { figmaUrl, brandId, userId, selectedFrameIds } = input;

      // Update status to IN_PROGRESS - fire and forget, don't block
      this.updateReviewStatus(designsReviewId, ReviewStatus.IN_PROGRESS);

      // Get basic file info first (fast call for name and key)
      const { fileKey } = this.figmaService.extractFigmaInfo(figmaUrl);
      const fileInfo = await this.figmaService.getFileInfo(fileKey);

      // Update review name immediately with actual file name
      if (fileInfo.name) {
        prisma.designsReview
          .update({
            where: { id: designsReviewId },
            data: {
              name: fileInfo.name,
              figmaFileId: fileKey,
            },
          })
          .catch(error => console.error("Failed to update review metadata:", error));
      }

      // Get brand rules
      const brandGuideline = await prisma.brandGuideline.findUnique({
        where: { id: brandId },
        include: {
          brandRules: true,
        },
      });

      if (!brandGuideline) {
        throw new Error("Brand guideline not found");
      }

      // Now get the full figma metadata with frames (the heavy operation)
      const figmaMetaData = await this.figmaService.getFramesMetadataByIdsFromFigma(
        figmaUrl,
        selectedFrameIds
      );

      // Process images for AI (keeping sequential since we need frame URLs from metadata)
      const processedImageParts = await Promise.all(
        figmaMetaData.frames.map(frame => this.figmaService.urlToInlineData(frame.url))
      );

      // Initialize AI service
      const aiService = await this.initAIProvider();

      // Analyze designs
      const analysisResult = await aiService.analyzeDesigns({
        imageParts: processedImageParts,
        metadata: figmaMetaData,
        brandRules: brandGuideline.brandRules as Partial<BrandRule>[],
      });

      // Save results to database
      await this.saveAnalysisResultsToExistingReview(
        designsReviewId,
        figmaMetaData,
        analysisResult,
        userId,
        figmaUrl
      );

      // Update status to COMPLETED - fire and forget, don't block
      this.updateReviewStatus(designsReviewId, ReviewStatus.COMPLETED);
    } catch (error) {
      console.error("Error processing design review in background:", error);
      // Update status to FAILED - fire and forget
      this.updateReviewStatus(designsReviewId, ReviewStatus.FAILED);

      throw error;
    }
  }

  /**
   * Save analysis results to an existing design review
   * @param designsReviewId Existing design review ID
   * @param metadata Figma metadata
   * @param analysisResult Analysis result
   * @param userId User ID (passed directly to avoid DB lookup)
   * @param originalFigmaUrl Original Figma URL
   */
  private async saveAnalysisResultsToExistingReview(
    designsReviewId: string,
    metadata: FigmaMetadata,
    analysisResult: DesignReviewResult[],
    userId: string,
    originalFigmaUrl?: string
  ): Promise<void> {
    try {
      const urlToFrameData: Record<string, Partial<FrameMetadata>> = {};
      for (const frame of metadata.frames) {
        urlToFrameData[frame.url] = {
          id: frame.id,
          position: frame.position,
        };
      }

      // Collect all comment creation promises for parallel execution
      const commentPromises: Promise<string>[] = [];

      // Prepare comment creation for all issues
      for (const review of analysisResult) {
        const frameData = urlToFrameData[review.image.url];
        if (frameData) {
          // Add brand issue comments
          if (review.brand_issues) {
            for (const issue of review.brand_issues) {
              const commentText = formatBrandIssueComment(issue);
              const commentPromise = this.figmaService.addFigmaComment(
                metadata.fileKey,
                frameData.id,
                commentText,
                issue.coordinates,
                frameData.position
              );
              commentPromises.push(commentPromise);

              // Store promise index to map back to issue later
              const promiseIndex = commentPromises.length - 1;
              (issue as any)._commentPromiseIndex = promiseIndex;
            }
          }

          // Add general issue comments
          if (review.general_issues) {
            for (const issue of review.general_issues) {
              const commentText = formatGeneralIssueComment(issue);
              const commentPromise = this.figmaService.addFigmaComment(
                metadata.fileKey,
                frameData.id,
                commentText,
                issue.coordinates,
                frameData.position
              );
              commentPromises.push(commentPromise);

              // Store promise index to map back to issue later
              const promiseIndex = commentPromises.length - 1;
              (issue as any)._commentPromiseIndex = promiseIndex;
            }
          }
        }
      }

      // Execute all comment creation in parallel
      const commentIds = await Promise.all(commentPromises);

      // Map comment IDs back to issues
      for (const review of analysisResult) {
        if (review.brand_issues) {
          for (const issue of review.brand_issues) {
            const promiseIndex = (issue as any)._commentPromiseIndex;
            if (promiseIndex !== undefined) {
              issue.figma_comment_id = commentIds[promiseIndex];
              delete (issue as any)._commentPromiseIndex; // Clean up temp property
            }
          }
        }

        if (review.general_issues) {
          for (const issue of review.general_issues) {
            const promiseIndex = (issue as any)._commentPromiseIndex;
            if (promiseIndex !== undefined) {
              issue.figma_comment_id = commentIds[promiseIndex];
              delete (issue as any)._commentPromiseIndex; // Clean up temp property
            }
          }
        }
      }

      // Use transaction to create all designs in parallel
      await prisma.$transaction(async tx => {
        await Promise.all(
          analysisResult.map(review =>
            tx.design.create({
              data: {
                userId,
                designsReviewId,
                frameId: review.image.frame_id,
                reviewJson: {
                  ...review,
                  created_at: new Date().toISOString(),
                } as any,
                status: ReviewStatus.COMPLETED,
                originalFigmaUrl,
                timeline: {
                  create: {
                    action: ReviewTimelineAction.INITIAL_REVIEW,
                    summary: generateInitialReviewSummary(
                      review.brand_issues,
                      review.general_issues
                    ),
                    changes: this.createInitialReviewChanges(
                      review.brand_issues,
                      review.general_issues,
                      review.design_score.total
                    ) as any,
                  },
                },
              },
            })
          )
        );
      });
    } catch (error) {
      console.error("Error saving analysis results to existing review:", error);
      throw error;
    }
  }
  /**
   * Recheck a design against previous comments
   * @param input Recheck input
   * @returns Recheck result
   */
  async recheckDesigns(input: DesignRecheckInput): Promise<string> {
    try {
      const { designsReviewId, brandId, userId, frameIds: selectedFrameIds } = input;

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

      const designs = await this.getDesingsByFrameIds(designsReviewId, selectedFrameIds);

      const designsReview = await this.getDesignsReviewOnly(designsReviewId);

      if (!designs?.length) {
        throw new Error("Design review not found");
      }

      const figmaMetaData = await this.figmaService.getFramesMetadataByIdsFromFigma(
        designsReview.figmaUrl,
        selectedFrameIds
      );

      // Process images for AI - use filtered URLs if available
      const imageParts = await Promise.all(
        figmaMetaData.frames.map(frame => this.figmaService.urlToInlineData(frame.url))
      );
      // Initialize the AI provider
      const aiProvider = await this.initAIProvider();

      // Create comment maps and prepare data for AI
      const { commentIdToIssue } = this.recheckService.createCommentMaps(designs);

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

      // Process recheck results and update the database
      await this.recheckService.processRecheckResult(recheckResult, figmaMetaData, designs);

      return designsReview.id;
    } catch (error) {
      console.error("Error rechecking design:", error);
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
  ): TimelineChanges {
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
      },
    });

    return review;
  }

  async getDesignsReviewOnly(designsReviewId: string): Promise<DesignsReview | null> {
    const review = await prisma.designsReview.findUnique({
      where: { id: designsReviewId },
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

  async getDesingsByFrameIds(
    designsReviewId: string,
    frameIds: string[]
  ): Promise<Design[] | null> {
    const desings = await prisma.design.findMany({
      where: {
        designsReviewId,
        frameId: { in: frameIds },
      },
      include: {
        user: true,
      },
    });

    return desings;
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

  async updateReviewStatus(id: string, status: ReviewStatus): Promise<void> {
    await prisma.designsReview.update({
      where: { id },
      data: {
        status,
      },
      include: {
        user: true,
        brandGuideline: true,
        designs: true,
      },
    });
  }
}
