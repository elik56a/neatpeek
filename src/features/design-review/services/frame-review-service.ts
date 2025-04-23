import { prisma } from "@/services/db/prisma";
import {
  FigmaMetadata,
  ReviewStatus,
  DesignReviewResult,
  DesignReviewWithFrame
} from "../types";



import { DesignReviewCoreService } from "./design-review-core-service";

/**
 * Service for managing frame reviews
 * This service handles operations related to individual frame reviews
 */
export class FrameReviewService {
  private coreService: DesignReviewCoreService;

  constructor(coreService: DesignReviewCoreService) {
    this.coreService = coreService;
  }

  /**
   * Save frame reviews for a session
   * @param sessionId Session ID
   * @param metadata Figma metadata
   * @param reviews Design review results
   * @returns Created frame reviews
   */
  async saveFrameReviews(
    sessionId: string,
    metadata: FigmaMetadata,
    reviews: DesignReviewResult[]
  ): Promise<DesignReviewWithFrame[]> {
    // Get the session to access the brandGuidelineId
    const session = await prisma.designReviewSession.findUnique({
      where: { id: sessionId },
      select: { brandGuidelineId: true }
    });

    if (!session) {
      throw new Error('Session not found');
    }
    const frameReviews: DesignReviewWithFrame[] = [];

    // Create URL to frame data mapping
    const urlToFrameData = this.coreService.createUrlToFrameDataMap(metadata);

    // Import utility functions
    const { formatBrandIssueComment, formatGeneralIssueComment } = await import('../utils');
    const { validateDesignReviewResult } = await import('../utils/validation');

    // Save frames and reviews
    for (const review of reviews) {
      // Validate the review result
      if (!validateDesignReviewResult(review)) {
        console.error('Invalid review result:', review);
        continue;
      }

      // Add timestamp to the review
      const reviewWithTimestamp = JSON.parse(JSON.stringify({
        ...review,
        created_at: new Date().toISOString()
      }));

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
          brandGuidelineId: session.brandGuidelineId, // Use the brandGuidelineId from the session
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
        await this.coreService.addFigmaComments(
          metadata,
          frameData,
          review.brand_issues,
          formatBrandIssueComment
        );
      }

      // Add Figma comment IDs to general issues
      if (frameData && review.general_issues) {
        await this.coreService.addFigmaComments(
          metadata,
          frameData,
          review.general_issues,
          formatGeneralIssueComment
        );
      }

      // Create design review for the frame
      const frameReview = await prisma.designReview.create({
        data: {
          sessionId,
          frameId: frame.id,
          reviewJson: reviewWithTimestamp,
          designScore: review.design_score.total,
          designScoreMax: review.design_score.max_score,
          brandComplianceScore: review.design_score.breakdown.brand_compliance,
          visualHarmonyScore: review.design_score.breakdown.visual_harmony,
          usabilityScore: review.design_score.breakdown.usability,
          accessibilityScore: review.design_score.breakdown.accessibility,
          status: ReviewStatus.COMPLETED,
        },
        include: {
          frame: {
            select: {
              id: true,
              frameId: true,
              name: true,
              imageUrl: true,
              figmaFileKey: true,
              figmaFileName: true
            }
          }
        }
      });

      frameReviews.push(frameReview as unknown as DesignReviewWithFrame);
    }

    return frameReviews;
  }

  /**
   * Find frames by Figma file key
   * @param fileKey Figma file key
   * @returns Frames with their most recent design reviews
   */
  async findFramesByFileKey(fileKey: string): Promise<any[]> {
    const frames = await prisma.figmaFrame.findMany({
      where: {
        figmaFileKey: fileKey,
      },
      include: {
        designReviews: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            session: {
              select: {
                id: true,
                figmaUrl: true,
                userId: true
              }
            }
          }
        },
      },
    });

    if (frames.length === 0) {
      throw new Error('No frames found for this Figma file. Please run an initial review first.');
    }

    return frames;
  }

  /**
   * Find frames by IDs
   * @param fileKey Figma file key
   * @param frameIds Frame IDs to find
   * @returns Frames with their most recent design reviews
   */
  async findFramesByIds(fileKey: string, frameIds: string[]): Promise<any[]> {
    const frames = await prisma.figmaFrame.findMany({
      where: {
        figmaFileKey: fileKey,
        frameId: {
          in: frameIds
        }
      },
      include: {
        designReviews: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            session: {
              select: {
                id: true,
                figmaUrl: true,
                userId: true
              }
            }
          }
        },
      },
    });

    if (frames.length === 0) {
      throw new Error('No frames found for the specified frame IDs. Please run an initial review first.');
    }

    return frames;
  }
}
