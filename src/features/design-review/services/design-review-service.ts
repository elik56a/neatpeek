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
  FigmaMetadata
} from '../types';
import { FigmaService } from './figma-service';

/**
 * Design Review Service
 */
export class DesignReviewService {
  private figmaService: FigmaService;
  private aiService: any = null;

  /**
   * Create a new DesignReviewService
   * @param figmaToken Figma API token
   */
  constructor(figmaToken: string) {
    this.figmaService = new FigmaService(figmaToken);
  }

  /**
   * Initialize the AI service
   */
  private async initAIService() {
    if (!this.aiService) {
      const { getAIService } = await import('@/services/ai');
      this.aiService = await getAIService();
    }
    return this.aiService;
  }

  /**
   * Analyze a design against brand rules
   * @param input Analysis input
   * @returns Analysis result
   */
  async analyzeDesign(input: DesignAnalysisInput): Promise<DesignAnalysisResult> {
    try {
      const { figmaUrl, brandId } = input;

      if (!figmaUrl) {
        throw new Error('Figma URL is required');
      }

      // Get brand rules
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        // Brand rules are stored in the brandRules field of the Brand model
        // which is a JSON field, not a relation
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      // Extract designs from Figma
      const { imageUrls, metadata } = await this.figmaService.extractDesignsFromFigma(figmaUrl);

      // Process images for AI
      const imageParts = await Promise.all(imageUrls.map(url => this.figmaService.urlToInlineData(url)));

      // Initialize AI service
      const aiService = await this.initAIService();

      // Analyze designs
      const analysisResult = await aiService.analyzeDesign({
        imageParts,
        metadata,
        brandRules: brand.brandRules
      });

      // Save results to database
      await this.saveAnalysisResults(brandId, metadata, analysisResult);

      // Add comments to Figma
      await this.addCommentsToFigma(metadata, analysisResult);

      return analysisResult;
    } catch (error) {
      console.error('Error analyzing design:', error);
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
      const { figmaUrl, brandId } = input;

      // Get brand rules
      const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        // Brand rules are stored in the brandRules field of the Brand model
        // which is a JSON field, not a relation
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      // Extract designs from Figma
      const { imageUrls, metadata } = await this.figmaService.extractDesignsFromFigma(figmaUrl);

      // Create set of current frame IDs for filtering
      const currentFrameIds = new Set(metadata.frames.map(frame => frame.id));

      // Fetch all comments
      const allComments = await this.figmaService.getFigmaComments(metadata.fileKey);

      // First, create a map of fixed comments
      const fixedCommentIds = new Set();
      allComments.forEach(comment => {
        if (comment.parent_id && comment.message.includes('✅') && comment.message.includes('Fixed')) {
          fixedCommentIds.add(comment.parent_id);
        }
      });

      // Group unfixed comments by frame
      const commentsByFrame = allComments.reduce((acc: any, comment: any) => {
        const frameId = comment.client_meta?.node_id;
        // Only include comments that:
        // 1. Are root comments (no parent_id)
        // 2. Belong to current frames
        // 3. Are not marked as fixed
        if (frameId &&
            currentFrameIds.has(frameId) &&
            !comment.parent_id &&
            !fixedCommentIds.has(comment.id)) {
          if (!acc[frameId]) {
            acc[frameId] = [];
          }
          acc[frameId].push(comment);
        }
        return acc;
      }, {});

      // Check if there are any unfixed comments to review
      const totalUnfixedComments = Object.values(commentsByFrame)
        .reduce((sum: number, comments: any[]) => sum + comments.length, 0);

      if (totalUnfixedComments === 0) {
        return {
          recheck_results: []
        };
      }

      // Process images for AI
      const imageParts = await Promise.all(imageUrls.map(url => this.figmaService.urlToInlineData(url)));

      // Initialize AI service
      const aiService = await this.initAIService();

      // Recheck designs
      const recheckResult = await aiService.recheckDesign({
        imageParts,
        metadata,
        brandRules: brand.brandRules,
        commentsByFrame
      });

      // Add thread comments based on recheck results
      await this.addRecheckCommentsToFigma(metadata, recheckResult);

      // Update comment status in database
      await this.updateCommentStatus(metadata.fileKey, recheckResult);

      return recheckResult;
    } catch (error) {
      console.error('Error rechecking design:', error);
      throw error;
    }
  }

  /**
   * Save analysis results to database
   * @param brandId Brand ID
   * @param metadata Figma metadata
   * @param analysisResult Analysis result
   */
  private async saveAnalysisResults(
    brandId: string,
    metadata: FigmaMetadata,
    analysisResult: DesignAnalysisResult
  ): Promise<void> {
    try {
      // Save the Figma file
      const figmaFile = await prisma.figmaFile.create({
        data: {
          projectId: brandId,
          figmaFileKey: metadata.fileKey,
          figmaFileName: metadata.fileName,
          lastSynced: new Date(),
        },
      });

      // Save frames and reviews
      for (const review of analysisResult.reviews) {
        // Save frame
        const frame = await prisma.figmaFrame.create({
          data: {
            figmaFileId: figmaFile.id,
            frameId: review.image.frame_id,
            name: review.image.name,
            imageUrl: review.image.url,
            screenType: review.image.screen_type,
            platform: review.image.platform,
            positionX: review.image.position.x,
            positionY: review.image.position.y,
            width: review.image.position.width,
            height: review.image.position.height,
          },
        });

        // Save design review
        const designReview = await prisma.designReview.create({
          data: {
            frameId: frame.id,
            reviewJson: review as any,
            designScore: review.design_score.total,
            designScoreMax: review.design_score.max_score,
            brandComplianceScore: review.design_score.breakdown.brand_compliance,
            visualHarmonyScore: review.design_score.breakdown.visual_harmony,
            usabilityScore: review.design_score.breakdown.usability,
            accessibilityScore: review.design_score.breakdown.accessibility,
            status: 'COMPLETED',
          },
        });

        // Save comments
        for (const issue of review.brand_issues) {
          await prisma.figmaComment.create({
            data: {
              reviewId: designReview.id,
              frameId: frame.id,
              messageType: 'BRAND_ISSUE',
              message: `${issue.description}\n${issue.brand_rule_violation}\n${issue.fix_suggestion}`,
              elementType: issue.element_type,
              severity: issue.severity.toUpperCase() as any,
              positionX: issue.coordinates.x,
              positionY: issue.coordinates.y,
              isResolved: false,
            },
          });
        }

        for (const issue of review.general_issues) {
          await prisma.figmaComment.create({
            data: {
              reviewId: designReview.id,
              frameId: frame.id,
              messageType: 'GENERAL_ISSUE',
              message: `${issue.description}\n${issue.issue}\n${issue.fix_suggestion}`,
              elementType: issue.element_type,
              severity: issue.severity.toUpperCase() as any,
              positionX: issue.coordinates.x,
              positionY: issue.coordinates.y,
              isResolved: false,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error saving analysis results:', error);
      throw error;
    }
  }

  /**
   * Add comments to Figma
   * @param metadata Figma metadata
   * @param analysisResult Analysis result
   */
  private async addCommentsToFigma(
    metadata: FigmaMetadata,
    analysisResult: DesignAnalysisResult
  ): Promise<void> {
    try {
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

      // Add comments for each review
      for (const review of analysisResult.reviews) {
        const frameData = urlToFrameData[review.image.url];
        if (!frameData) {
          console.warn(`No frame data found for URL: ${review.image.url}`);
          continue;
        }

        // Handle brand issues
        for (const issue of review.brand_issues) {
          const coordinates = issue.coordinates;

          const commentId = await this.figmaService.addFigmaComment(
            metadata.fileKey,
            frameData.id,
            `🚨 ${issue.severity.toUpperCase()} Brand Issue: ${issue.description}\n📋 Rule: ${issue.brand_rule_violation}\n💡 Fix: ${issue.fix_suggestion}`,
            coordinates,
            frameData.position
          );

          // Update the comment ID in the database
          await prisma.figmaComment.updateMany({
            where: {
              messageType: 'BRAND_ISSUE',
              message: { contains: issue.description },
              frameId: {
                in: await this.getFrameIdsByFigmaFrameId(frameData.id)
              }
            },
            data: {
              commentId
            }
          });
        }

        // Handle general issues
        for (const issue of review.general_issues) {
          const coordinates = issue.coordinates;

          const commentId = await this.figmaService.addFigmaComment(
            metadata.fileKey,
            frameData.id,
            `⚠️ ${issue.severity.toUpperCase()} UX Issue: ${issue.description}\n💡 Fix: ${issue.fix_suggestion}`,
            coordinates,
            frameData.position
          );

          // Update the comment ID in the database
          await prisma.figmaComment.updateMany({
            where: {
              messageType: 'GENERAL_ISSUE',
              message: { contains: issue.description },
              frameId: {
                in: await this.getFrameIdsByFigmaFrameId(frameData.id)
              }
            },
            data: {
              commentId
            }
          });
        }
      }
    } catch (error) {
      console.error('Error adding comments to Figma:', error);
      throw error;
    }
  }

  /**
   * Add recheck comments to Figma
   * @param metadata Figma metadata
   * @param recheckResult Recheck result
   */
  private async addRecheckCommentsToFigma(
    metadata: FigmaMetadata,
    recheckResult: DesignRecheckResult
  ): Promise<void> {
    try {
      // Add thread comments based on recheck results
      for (const frameResult of recheckResult.recheck_results) {
        // Handle existing comment checks
        for (const check of frameResult.comment_checks) {
          // Only add comment if it's not a "fixed" status or if no "fixed" comment exists
          // Type assertion to handle the conditional logic
          const status = check.check_result.status as string;

          if (status !== 'fixed') {
            const emoji = status === 'partially_fixed' ? '🔸' : '👀';

            let message = '';
            if (status === 'not_fixed') {
              message = `${emoji} Issue still exists`;
            } else {
              message = `${emoji} ${check.check_result.details}\n${check.check_result.remaining_issues ? `Still needs work: ${check.check_result.remaining_issues}` : ''}`;
            }

            await this.figmaService.addThreadComment(
              metadata.fileKey,
              check.comment_id,
              message
            );
          }
        }

        // Add any new issues found
        if (frameResult.new_issues && frameResult.new_issues.length > 0) {
          const frameData = metadata.frames.find(f => f.id === frameResult.frame_id);
          if (frameData) {
            // Find the frame in the database
            const dbFrame = await prisma.figmaFrame.findFirst({
              where: {
                frameId: frameResult.frame_id,
                figmaFile: {
                  figmaFileKey: metadata.fileKey,
                },
              },
              include: {
                designReviews: {
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                },
              },
            });

            if (dbFrame && dbFrame.designReviews.length > 0) {
              const reviewId = dbFrame.designReviews[0].id;

              for (const issue of frameResult.new_issues) {
                // Add comment to Figma
                const commentId = await this.figmaService.addFigmaComment(
                  metadata.fileKey,
                  frameResult.frame_id,
                  `🆕 New Issue Found:\n${issue.description}\nSeverity: ${issue.severity}`,
                  issue.coordinates,
                  frameData.position
                );

                // Save comment to database
                await prisma.figmaComment.create({
                  data: {
                    reviewId,
                    frameId: dbFrame.id,
                    commentId,
                    messageType: 'NEW_ISSUE',
                    message: issue.description,
                    elementType: issue.element_type,
                    severity: issue.severity.toUpperCase() as any,
                    positionX: issue.coordinates.x,
                    positionY: issue.coordinates.y,
                    isResolved: false,
                  },
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error adding recheck comments to Figma:', error);
      throw error;
    }
  }

  /**
   * Update comment status in database
   * @param fileKey Figma file key
   * @param recheckResult Recheck result
   */
  private async updateCommentStatus(
    fileKey: string,
    recheckResult: DesignRecheckResult
  ): Promise<void> {
    try {
      // Get the Figma file from the database
      const figmaFile = await prisma.figmaFile.findFirst({
        where: {
          figmaFileKey: fileKey,
        },
      });

      if (!figmaFile) {
        console.warn(`No Figma file found for key: ${fileKey}`);
        return;
      }

      // Update comment status for each frame
      for (const frameResult of recheckResult.recheck_results) {
        // Get the frame from the database
        const frame = await prisma.figmaFrame.findFirst({
          where: {
            figmaFileId: figmaFile.id,
            frameId: frameResult.frame_id,
          },
        });

        if (!frame) {
          console.warn(`No frame found for ID: ${frameResult.frame_id}`);
          continue;
        }

        // Update comment status for each check
        for (const check of frameResult.comment_checks) {
          // Update comment status in database
          await prisma.figmaComment.updateMany({
            where: {
              commentId: check.comment_id,
            },
            data: {
              isResolved: check.check_result.status === 'fixed',
              recheckStatus: check.check_result.status.toUpperCase() as any,
              recheckDetails: check.check_result.details,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
      throw error;
    }
  }

  /**
   * Get database frame IDs by Figma frame ID
   * @param figmaFrameId Figma frame ID
   * @returns Array of database frame IDs
   */
  private async getFrameIdsByFigmaFrameId(figmaFrameId: string): Promise<string[]> {
    try {
      const frames = await prisma.figmaFrame.findMany({
        where: {
          frameId: figmaFrameId,
        },
        select: {
          id: true,
        },
      });

      return frames.map(frame => frame.id);
    } catch (error) {
      console.error('Error getting frame IDs:', error);
      throw error;
    }
  }
}
