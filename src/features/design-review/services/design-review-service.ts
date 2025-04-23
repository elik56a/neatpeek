/**
 * Design Review Service
 *
 * This service coordinates between the Figma and AI services to provide
 * a complete design review workflow.
 *
 * NOTE: This service is server-side only and should not be imported on the client.
 */

// This service is server-side only and should not be imported on the client
import { prisma } from '@/services/db/prisma';
import {
  DesignAnalysisInput,
  DesignAnalysisResult,
  DesignRecheckInput,
  DesignRecheckResult,
  FigmaMetadata,
  ReviewHistoryAction,
  ReviewStatus
} from '../types';
import { createSession, createHistoryEntry, updateSessionStatus } from '../utils/session-utils';
import { DesignReviewCoreService } from './design-review-core-service';
import { DesignRecheckService } from './design-recheck-service';

/**
 * Design Review Service
 */
export class DesignReviewService {
  private coreService: DesignReviewCoreService;
  private recheckService: DesignRecheckService;

  /**
   * Create a new DesignReviewService
   * @param figmaToken Figma API token
   */
  constructor(figmaToken: string) {
    this.coreService = new DesignReviewCoreService(figmaToken);
    this.recheckService = new DesignRecheckService(this.coreService);
  }

  /**
   * Review a design against brand rules
   * @param input Review input with optional selectedFrameIds and userId
   * @returns Review result
   */
  // async analyzeDesign(input: DesignAnalysisInput & { selectedFrameIds?: string[], userId: string }): Promise<DesignAnalysisResult & { sessionId?: string }> {
  //   try {
  //     const { figmaUrl, brandId, userId } = input;

  //     if (!figmaUrl) {
  //       throw new Error('Figma URL is required');
  //     }

  //     if (!userId) {
  //       throw new Error('User ID is required');
  //     }

  //     // Get brand rules
  //     const brandGuideline = await prisma.brandGuideline.findUnique({
  //       where: { id: brandId },
  //       include: {
  //         brandRules: true,
  //       },
  //     });

  //     if (!brandGuideline) {
  //       throw new Error('brandGuideline not found');
  //     }

  //     // Extract designs from Figma
  //     const { imageUrls, metadata } = await this.coreService.extractDesignsFromFigma(figmaUrl);

  //     // Filter frames if selectedFrameIds is provided
  //     const { selectedFrameIds } = input;
  //     let filteredImageUrls = imageUrls;

  //     if (selectedFrameIds && selectedFrameIds.length > 0) {
  //       // Create a map of frame IDs to image URLs
  //       const frameIdToImageUrl = metadata.frames.reduce<Record<string, string>>((map, frame) => {
  //         if (frame.id && frame.url) {
  //           map[frame.id] = frame.url;
  //         }
  //         return map;
  //       }, {});

  //       // Filter image URLs based on selected frame IDs
  //       filteredImageUrls = selectedFrameIds
  //         .map(frameId => frameIdToImageUrl[frameId])
  //         .filter(Boolean) as string[];

  //       console.log(`Filtered ${imageUrls.length} frames down to ${filteredImageUrls.length} selected frames`);
  //     }

  //     // Process images for AI - use filtered URLs if available
  //     const imageParts = await this.coreService.processImagesForAI(filteredImageUrls);

  //     // Initialize AI service
  //     const aiService = await this.coreService.initAIService();

  //     // Analyze designs
  //     const analysisResult = await aiService.analyzeDesign({
  //       imageParts,
  //       metadata,
  //       brandRules: brandGuideline.brandRules
  //     });

  //     // Create a session for this analysis
  //     const session = await createSession({
  //       userId,
  //       brandGuidelineId: brandId,
  //       figmaUrl,
  //       figmaFileKey: metadata.fileKey,
  //       figmaFileName: metadata.fileName
  //     });

  //     // Save results to database and get review IDs
  //     const reviewIds = await this.saveAnalysisResults(session.id, brandId, userId, metadata, analysisResult);

  //     // Convert reviewIds to an array if it's not already
  //     const reviewIdArray = Array.isArray(reviewIds) ? reviewIds : [reviewIds];

  //     // Create initial history entry for the session
  //     await createHistoryEntry({
  //       sessionId: session.id,
  //       action: ReviewHistoryAction.INITIAL_REVIEW,
  //       summary: `Initial analysis of ${analysisResult.reviews.length} frames`,
  //       changes: {
  //         // Use standard HistoryChanges properties
  //         brand_issues_count: analysisResult.reviews.reduce((sum: number, review: any) => sum + (review.brand_issues?.length || 0), 0),
  //         general_issues_count: analysisResult.reviews.reduce((sum: number, review: any) => sum + (review.general_issues?.length || 0), 0),
  //         total_issues_count: analysisResult.reviews.reduce((sum: number, review: any) => {
  //           return sum +
  //             (review.brand_issues?.length || 0) +
  //             (review.general_issues?.length || 0);
  //         }, 0),
  //         design_score: analysisResult.reviews.reduce((sum: number, review: any) => sum + review.design_score.total, 0) / analysisResult.reviews.length,
  //         fixed_count: 0,
  //         partially_fixed_count: 0,
  //         not_fixed_count: 0
  //       }
  //     });

  //     // Update session status
  //     await updateSessionStatus(session.id, ReviewStatus.COMPLETED);

  //     // Add the session ID and main review ID to the result
  //     // We use the first review ID as the main ID for backward compatibility
  //     if (reviewIdArray.length > 0) {
  //       const mainReviewId = reviewIdArray[0];
  //       console.log('Setting main reviewId to:', mainReviewId);
  //       console.log('Setting sessionId to:', session.id);

  //       // Set the reviewId property to the main review ID
  //       // This is what the client will use for navigation
  //       analysisResult.reviewId = mainReviewId;
  //       analysisResult.sessionId = session.id; // Add session ID
  //       analysisResult.brandId = brandId;
  //       analysisResult.figmaUrl = figmaUrl;
  //       analysisResult.fileName = metadata.fileName;
  //     } else {
  //       console.warn('No review IDs returned from saveAnalysisResults');
  //     }

  //     return analysisResult;
  //   } catch (error) {
  //     console.error('Error analyzing design:', error);
  //     throw error;
  //   }
  // }

  /**
   * Recheck a design against previous comments
   * @param input Recheck input
   * @returns Recheck result
   */
  async recheckDesign(input: DesignRecheckInput): Promise<DesignRecheckResult> {
    try {
      const { figmaUrl, brandId, userId, frameId, frameIds } = input;

      if (!userId) {
        throw new Error('User ID is required');
      }

      // Get brand guideline
      const brandGuideline = await prisma.brandGuideline.findUnique({
        where: { id: brandId },
        include: {
          brandRules: true,
        },
      });

      if (!brandGuideline) {
        throw new Error('Brand guideline not found');
      }

      // Extract designs from Figma
      let extractionResult = await this.coreService.extractDesignsFromFigma(figmaUrl);
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
      console.log('Frames found:', frames.length);
      if (frames.length > 0) {
        console.log('First frame designReviews:', frames[0].designReviews?.length || 0);
      }

      if (frames.length > 0 && frames[0].designReviews && frames[0].designReviews.length > 0) {
        // Log the review to debug
        console.log('First review:', JSON.stringify(frames[0].designReviews[0], null, 2));

        const originalUrl = frames[0].designReviews[0].originalFigmaUrl;
        if (originalUrl) {
          console.log(`Using original Figma URL from database: ${originalUrl}`);
          figmaUrlToUse = originalUrl;

          // If the URLs are different, we need to re-extract designs from Figma
          if (originalUrl !== figmaUrl) {
            extractionResult = await this.coreService.extractDesignsFromFigma(originalUrl);
            imageUrls = extractionResult.imageUrls;
            metadata = extractionResult.metadata;
          }
        } else {
          console.log('No originalFigmaUrl found in the database, using provided URL');
        }
      }

      // Process images for AI
      const imageParts = await this.coreService.processImagesForAI(imageUrls);

      // Initialize AI service
      const aiService = await this.coreService.initAIService();

      // Create comment maps and prepare data for AI
      const { commentIdToIssue } = this.recheckService.createCommentMaps(frames);
      const commentsByFrame = await this.recheckService.prepareCommentsByFrameFromMap(commentIdToIssue);

      // Recheck designs
      const recheckResult = await aiService.recheckDesign({
        imageParts,
        metadata,
        brandRules: brandGuideline.brandRules,
        commentsByFrame
      });

      // Process recheck results and update the database
      const updatedReviews = await this.recheckService.processRecheckResult(
        recheckResult,
        metadata,
        frames
      );

      // Add the main updated review to the result
      if (updatedReviews.size > 0) {
        // Get the first review ID as the main ID
        const mainReviewId = Array.from(updatedReviews.keys())[0];
        console.log('Setting main recheck reviewId to:', mainReviewId);

        // Set the reviewId property to the main review ID
        // This is what the client will use for navigation
        recheckResult.updatedReview = updatedReviews.get(mainReviewId);
        recheckResult.reviewId = mainReviewId;
        recheckResult.brandId = brandId;
        recheckResult.figmaUrl = figmaUrlToUse;
        recheckResult.fileName = metadata.fileName;
      } else {
        console.warn('No updated reviews returned from processRecheckResult');
      }

      return recheckResult;
    } catch (error) {
      console.error('Error rechecking design:', error);
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
  // Removed createInitialReviewChanges as we now use the session-utils

  private async saveAnalysisResults(
    sessionId: string,
    brandGuidelineId: string,
    _userId: string, // Prefix with underscore to indicate it's not used
    metadata: FigmaMetadata,
    analysisResult: DesignAnalysisResult
  ): Promise<string[]> {
    // Initialize array to store review IDs
    const reviewIds: string[] = [];
    try {
      // Import utility functions
      const { formatBrandIssueComment, formatGeneralIssueComment } = await import('../utils');
      // We now use session-level history entries
      const { validateDesignReviewResult } = await import('../utils/validation');

      // Create URL to frame data mapping
      const urlToFrameData = metadata.frames.reduce<Record<string, { id: string; position: any }>>((map, frame) => {
        if (frame.url && frame.id && frame.position) {
          map[frame.url] = {
            id: frame.id,
            position: frame.position
          };
        }
        return map;
      }, {});

      // Save frames and reviews
      for (const review of analysisResult.reviews) {
        // Validate the review result
        if (!validateDesignReviewResult(review)) {
          console.error('Invalid review result:', review);
          continue;
        }

        // Add timestamp to the review
        const reviewWithTimestamp = {
          ...review,
          created_at: new Date().toISOString()
        };

        // Find or create frame
        const frame = await prisma.figmaFrame.upsert({
          where: {
            figmaFileKey_frameId: {
              figmaFileKey: metadata.fileKey,
              frameId: review.image.frame_id
            }
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
            const commentId = await this.coreService.getFigmaService().addFigmaComment(
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
            const commentId = await this.coreService.getFigmaService().addFigmaComment(
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

        // Save design review with session ID
        const designReview = await prisma.designReview.create({
          data: {
            sessionId, // Link to the session
            frameId: frame.id,
            reviewJson: reviewWithTimestamp as any,
            designScore: review.design_score.total,
            designScoreMax: review.design_score.max_score,
            brandComplianceScore: review.design_score.breakdown.brand_compliance,
            visualHarmonyScore: review.design_score.breakdown.visual_harmony,
            usabilityScore: review.design_score.breakdown.usability,
            accessibilityScore: review.design_score.breakdown.accessibility,
            status: ReviewStatus.COMPLETED
          },
        });

        // We now create history entries at the session level, not for individual reviews

        // Add the review ID to the array
        console.log('Created design review with ID:', designReview.id);
        reviewIds.push(designReview.id);
      }

      console.log('Returning review IDs:', reviewIds);
      return reviewIds;
    } catch (error) {
      console.error('Error saving analysis results:', error);
      throw error;
    }
  }
}
