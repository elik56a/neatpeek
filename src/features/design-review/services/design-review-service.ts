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
  ReviewStatus,
} from "../types";
import { FigmaService } from "./figma-service";
import { DesignRecheckService } from "./design-recheck-service";

/**
 * Design Review Service
 */
export class DesignReviewService {
  private figmaService: FigmaService;
  private recheckService: DesignRecheckService;
  private aiService: any = null;

  /**
   * Create a new DesignReviewService
   * @param figmaToken Figma API token
   */
  constructor(figmaToken: string) {
    this.figmaService = new FigmaService(figmaToken);
    this.recheckService = new DesignRecheckService(this.figmaService);
  }

  /**
   * Initialize the AI service
   */
  private async initAIService() {
    if (!this.aiService) {
      const { getAIService } = await import("@/services/ai");
      this.aiService = await getAIService();
    }
    return this.aiService;
  }

  /**
   * Review a design against brand rules
   * @param input Review input with optional selectedFrameIds and userId
   * @returns Review result
   */
  async analyzeDesign(
    input: DesignAnalysisInput & { selectedFrameIds?: string[]; userId: string }
  ): Promise<DesignAnalysisResult> {
    try {
      const { figmaUrl, brandId, userId } = input;

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
      const { imageUrls, metadata } = await this.figmaService.extractDesignsFromFigma(figmaUrl);

      // Filter frames if selectedFrameIds is provided
      const { selectedFrameIds } = input;
      let filteredImageUrls = imageUrls;

      if (selectedFrameIds && selectedFrameIds.length > 0) {
        // Create a map of frame IDs to image URLs
        const frameIdToImageUrl = metadata.frames.reduce<Record<string, string>>((map, frame) => {
          if (frame.id && frame.url) {
            map[frame.id] = frame.url;
          }
          return map;
        }, {});

        // Filter image URLs based on selected frame IDs
        filteredImageUrls = selectedFrameIds
          .map(frameId => frameIdToImageUrl[frameId])
          .filter(Boolean) as string[];

        console.log(
          `Filtered ${imageUrls.length} frames down to ${filteredImageUrls.length} selected frames`
        );
      }

      // Process images for AI - use filtered URLs if available
      const imageParts = await Promise.all(
        filteredImageUrls.map(url => this.figmaService.urlToInlineData(url))
      );

      // Initialize AI service
      const aiService = await this.initAIService();

      // Analyze designs
      const analysisResult = await aiService.analyzeDesign({
        imageParts,
        metadata,
        brandRules: brandGuideline.brandRules,
      });

      // Save results to database and get review IDs
      const reviewIds = await this.saveAnalysisResults(
        brandId,
        userId,
        metadata,
        analysisResult,
        figmaUrl
      );

      // Add the first review ID to the result
      if (reviewIds.length > 0) {
        analysisResult.reviewId = reviewIds[0];
        analysisResult.brandId = brandId;
        analysisResult.figmaUrl = figmaUrl;
        analysisResult.fileName = metadata.fileName;
      }

      return analysisResult;
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
  async recheckDesign(input: DesignRecheckInput): Promise<DesignRecheckResult> {
    try {
      const { figmaUrl, brandId, userId, frameId, frameIds } = input;

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

      // Extract designs from Figma
      let extractionResult = await this.figmaService.extractDesignsFromFigma(figmaUrl);
      let imageUrls = extractionResult.imageUrls;
      let metadata = extractionResult.metadata;

      // Find frames in the database for this Figma file
      let frames: any[];

      // If frameIds is provided, use it to filter frames
      if (frameIds && frameIds.length > 0) {
        frames = await this.recheckService.findFramesByIds(metadata.fileKey, frameIds);
      }
      // If frameId is provided, use it to filter frames
      else if (frameId) {
        frames = await this.recheckService.findFramesByIds(metadata.fileKey, [frameId]);
      }
      // Otherwise, get all frames for the file
      else {
        frames = await this.recheckService.findFramesForFile(metadata.fileKey);
      }

      // Check if we have the original Figma URL stored in the database
      // If we do, we'll use that for rechecking instead of the provided URL
      let figmaUrlToUse = figmaUrl;

      // Log the frames to debug
      console.log("Frames found:", frames.length);
      if (frames.length > 0) {
        console.log("First frame designReviews:", frames[0].designReviews?.length || 0);
      }

      if (frames.length > 0 && frames[0].designReviews && frames[0].designReviews.length > 0) {
        // Log the review to debug
        console.log("First review:", JSON.stringify(frames[0].designReviews[0], null, 2));

        const originalUrl = frames[0].designReviews[0].originalFigmaUrl;
        if (originalUrl) {
          console.log(`Using original Figma URL from database: ${originalUrl}`);
          figmaUrlToUse = originalUrl;

          // If the URLs are different, we need to re-extract designs from Figma
          if (originalUrl !== figmaUrl) {
            extractionResult = await this.figmaService.extractDesignsFromFigma(originalUrl);
            imageUrls = extractionResult.imageUrls;
            metadata = extractionResult.metadata;
          }
        } else {
          console.log("No originalFigmaUrl found in the database, using provided URL");
        }
      }

      // Process images for AI
      const imageParts = await Promise.all(
        imageUrls.map(url => this.figmaService.urlToInlineData(url))
      );

      // Initialize AI service
      const aiService = await this.initAIService();

      // Create comment maps and prepare data for AI
      const { commentIdToIssue } = this.recheckService.createCommentMaps(frames);
      const commentsByFrame = await this.recheckService.prepareCommentsByFrame(
        metadata.fileKey,
        commentIdToIssue
      );

      // Recheck designs
      const recheckResult = await aiService.recheckDesign({
        imageParts,
        metadata,
        brandRules: brandGuideline.brandRules,
        commentsByFrame,
      });

      // Process recheck results and update the database
      const updatedReviews = await this.recheckService.processRecheckResult(
        recheckResult,
        metadata,
        frames
      );

      // Add the updated review to the result
      if (updatedReviews.size > 0) {
        // Just use the first updated review for now (we can enhance this later)
        const firstReviewId = Array.from(updatedReviews.keys())[0];
        recheckResult.updatedReview = updatedReviews.get(firstReviewId);
        recheckResult.reviewId = firstReviewId;
        recheckResult.brandId = brandId;
        recheckResult.figmaUrl = figmaUrlToUse;
        recheckResult.fileName = metadata.fileName;
      }

      return recheckResult;
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
   */
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

  private async saveAnalysisResults(
    brandGuidelineId: string,
    userId: string,
    metadata: FigmaMetadata,
    analysisResult: DesignAnalysisResult,
    originalFigmaUrl?: string
  ): Promise<string[]> {
    // Array to store created review IDs
    const reviewIds: string[] = [];
    try {
      // Import utility functions
      const { formatBrandIssueComment, formatGeneralIssueComment } = await import("../utils");
      const { generateInitialReviewSummary } = await import("../utils/history-formatters");
      const { validateDesignReviewResult } = await import("../utils/validation");

      // Create URL to frame data mapping
      const urlToFrameData = metadata.frames.reduce<Record<string, { id: string; position: any }>>(
        (map, frame) => {
          if (frame.url && frame.id && frame.position) {
            map[frame.url] = {
              id: frame.id,
              position: frame.position,
            };
          }
          return map;
        },
        {}
      );

      // Save frames and reviews
      for (const review of analysisResult.reviews) {
        // Validate the review result
        if (!validateDesignReviewResult(review)) {
          console.error("Invalid review result:", review);
          continue;
        }

        // Add timestamp to the review
        const reviewWithTimestamp = {
          ...review,
          created_at: new Date().toISOString(),
        };

        // Find or create frame
        const frame = await prisma.figmaFrame.upsert({
          where: {
            figmaFileKey_frameId: {
              figmaFileKey: metadata.fileKey,
              frameId: review.image.frame_id,
            },
          },
          update: {
            name: review.image.name,
            imageUrl: review.image.url,
            figmaFileName: metadata.fileName,
            screenType: review.image.screen_type,
            platform: review.image.platform,
            positionX: review.image.position.x,
            positionY: review.image.position.y,
            width: review.image.position.width,
            height: review.image.position.height,
            lastSynced: new Date(),
          },
          create: {
            brandGuidelineId: brandGuidelineId,
            figmaFileKey: metadata.fileKey,
            figmaFileName: metadata.fileName,
            frameId: review.image.frame_id,
            name: review.image.name,
            imageUrl: review.image.url,
            screenType: review.image.screen_type,
            platform: review.image.platform,
            positionX: review.image.position.x,
            positionY: review.image.position.y,
            width: review.image.position.width,
            height: review.image.position.height,
            lastSynced: new Date(),
          },
        });

        // Get frame data for Figma comments
        const frameData = urlToFrameData[review.image.url];

        // Add Figma comment IDs to brand issues
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

            // Store the comment ID directly in the issue
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

        // Save design review
        const designReview = await prisma.designReview.create({
          data: {
            userId: userId,
            brandGuidelineId: brandGuidelineId,
            frameId: frame.id,
            reviewJson: reviewWithTimestamp as any,
            designScore: review.design_score.total,
            designScoreMax: review.design_score.max_score,
            brandComplianceScore: review.design_score.breakdown.brand_compliance,
            visualHarmonyScore: review.design_score.breakdown.visual_harmony,
            usabilityScore: review.design_score.breakdown.usability,
            accessibilityScore: review.design_score.breakdown.accessibility,
            status: ReviewStatus.COMPLETED,
            originalFigmaUrl: originalFigmaUrl, // Save the original Figma URL
          },
        });

        // Create history entry for initial review
        const summary = generateInitialReviewSummary(review.brand_issues, review.general_issues);

        await prisma.reviewHistory.create({
          data: {
            designReviewId: designReview.id,
            action: ReviewHistoryAction.INITIAL_REVIEW,
            summary,
            changes: this.createInitialReviewChanges(
              review.brand_issues,
              review.general_issues,
              review.design_score.total
            ) as any, // Cast to any for Prisma JSON field compatibility
            timestamp: new Date(),
          },
        });

        // Add the review ID to the array
        reviewIds.push(designReview.id);
      }

      return reviewIds;
    } catch (error) {
      console.error("Error saving analysis results:", error);
      throw error;
    }
  }
}
