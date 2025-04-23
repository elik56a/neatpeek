/**
 * Design Recheck Service
 *
 * This service handles the recheck process for design reviews.
 * It's responsible for:
 * - Finding existing reviews for frames
 * - Mapping comment IDs to issues
 * - Processing recheck results
 * - Updating review JSON with new statuses
 * - Creating history entries
 */

import { prisma } from '@/services/db/prisma';
import {
  FigmaMetadata,
  DesignRecheckResult,
  FrameRecheckResult,
  CommentCheckResult,
  IssueStatus,
  BrandIssue,
  GeneralIssue,
  ReviewJson,
  ReviewHistoryAction,
  IssueType,
  HistoryChanges
} from '../types';
import { FigmaService } from './figma-service';
import { countIssuesByStatus, generateHistoryChanges, generateNewIssuesSummary, generateRecheckSummary } from '../utils/history-formatters';
import { formatNewIssueComment, formatRecheckComment } from '../utils/comment-formatters';
import { FigmaFrame, DesignReview } from '@/types';

/**
 * Interface for frame with design reviews
 */
interface FrameWithReviews extends FigmaFrame {
  designReviews: DesignReview[];
}

/**
 * Interface for issue information
 */
interface IssueInfo {
  issue: BrandIssue | GeneralIssue;
  type: IssueType;
  reviewId: string;
  frameId: string;
}

/**
 * Interface for comment maps
 */
interface CommentMaps {
  commentIdToIssue: Map<string, IssueInfo>;
  frameIdToReviewJson: Map<string, ReviewJson>;
}

/**
 * Interface for processed recheck result
 */
interface ProcessedRecheckResult {
  reviewId: string;
  updatedReviewJson: ReviewJson;
  historyAction: ReviewHistoryAction;
  historySummary: string;
  historyChanges: HistoryChanges;
}

/**
 * Design Recheck Service
 */
export class DesignRecheckService {
  private figmaService: FigmaService;

  /**
   * Create a new DesignRecheckService
   * @param figmaService Figma service instance
   */
  constructor(figmaService: FigmaService) {
    this.figmaService = figmaService;
  }

  /**
   * Find frames in the database for a Figma file
   * @param fileKey Figma file key
   * @returns Array of frames with their most recent design reviews
   */
  async findFramesForFile(fileKey: string): Promise<FrameWithReviews[]> {
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
          // We need all fields for the DesignReview type
          // but we're particularly interested in originalFigmaUrl
        },
      },
    });

    if (frames.length === 0) {
      throw new Error('No frames found for this Figma file. Please run an initial review first.');
    }

    return frames as FrameWithReviews[];
  }

  /**
   * Find specific frames in the database by their IDs
   * @param fileKey Figma file key
   * @param frameIds Array of frame IDs to find
   * @returns Array of frames with their most recent design reviews
   */
  async findFramesByIds(fileKey: string, frameIds: string[]): Promise<FrameWithReviews[]> {
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
          // We need all fields for the DesignReview type
          // but we're particularly interested in originalFigmaUrl
        },
      },
    });

    if (frames.length === 0) {
      throw new Error('No frames found for the specified frame IDs. Please run an initial review first.');
    }

    return frames as FrameWithReviews[];
  }

  /**
   * Create a map of frame IDs to their most recent design reviews
   * @param frames Array of frames with design reviews
   * @returns Map of frame IDs to reviews
   */
  createFrameToReviewMap(frames: FrameWithReviews[]): Record<string, DesignReview> {
    return frames.reduce<Record<string, DesignReview>>((map, frame) => {
      if (frame.designReviews && frame.designReviews.length > 0) {
        map[frame.frameId] = frame.designReviews[0];
      }
      return map;
    }, {});
  }

  /**
   * Create maps for comment IDs to issues and frame IDs to review JSON
   * @param frames Array of frames with design reviews
   * @returns Maps for comment IDs and review JSON
   */
  createCommentMaps(frames: FrameWithReviews[]): CommentMaps {
    const commentIdToIssue = new Map<string, IssueInfo>();
    const frameIdToReviewJson = new Map<string, ReviewJson>();

    for (const frame of frames) {
      if (frame.designReviews && frame.designReviews.length > 0) {
        const review = frame.designReviews[0];
        const reviewJson = review.reviewJson as ReviewJson;
        frameIdToReviewJson.set(frame.frameId, reviewJson);

        // Process brand issues
        if (reviewJson.brand_issues) {
          for (const issue of reviewJson.brand_issues) {
            if (issue.figma_comment_id) {
              commentIdToIssue.set(issue.figma_comment_id, {
                issue,
                type: IssueType.BRAND_ISSUE,
                reviewId: review.id,
                frameId: frame.id
              });
            }
          }
        }

        // Process general issues
        if (reviewJson.general_issues) {
          for (const issue of reviewJson.general_issues) {
            if (issue.figma_comment_id) {
              commentIdToIssue.set(issue.figma_comment_id, {
                issue,
                type: IssueType.GENERAL_ISSUE,
                reviewId: review.id,
                frameId: frame.id
              });
            }
          }
        }
      }
    }

    return { commentIdToIssue, frameIdToReviewJson };
  }

  /**
   * Prepare comment data for AI by grouping comments by frame
   * @param fileKey Figma file key
   * @param commentIdToIssue Map of comment IDs to issues
   * @returns Record of frame IDs to arrays of comments
   */
  async prepareCommentsByFrame(fileKey: string, commentIdToIssue: Map<string, IssueInfo>): Promise<Record<string, any[]>> {
    const commentsByFrame: Record<string, any[]> = {};

    // Fetch all comments from Figma
    const allComments = await this.figmaService.getFigmaComments(fileKey);

    // Group comments by frame
    for (const comment of allComments) {
      const frameId = comment.client_meta?.node_id;
      if (frameId && !comment.parent_id && commentIdToIssue.has(comment.id)) {
        if (!commentsByFrame[frameId]) {
          commentsByFrame[frameId] = [];
        }
        commentsByFrame[frameId].push(comment);
      }
    }

    return commentsByFrame;
  }

  /**
   * Process a single frame recheck result
   * @param frameResult Frame recheck result
   * @param metadata Figma metadata
   * @param commentIdToIssue Map of comment IDs to issues
   * @param frameIdToReviewJson Map of frame IDs to review JSON
   * @param frameIdToReview Map of frame IDs to reviews
   * @returns Processed result with updated review and history entry
   */
  async processFrameRecheckResult(
    frameResult: FrameRecheckResult,
    metadata: FigmaMetadata,
    commentIdToIssue: Map<string, IssueInfo>,
    frameIdToReviewJson: Map<string, ReviewJson>,
    frameIdToReview: Record<string, DesignReview>
  ): Promise<ProcessedRecheckResult | null> {
    const frameId = frameResult.frame_id;

    if (!frameIdToReviewJson.has(frameId)) {
      console.warn(`No review found for frame ID: ${frameId}`);
      return null;
    }

    const review = frameIdToReview[frameId];
    const reviewJson = JSON.parse(JSON.stringify(frameIdToReviewJson.get(frameId))) as ReviewJson;

    // Add updated_at timestamp
    reviewJson.updated_at = new Date().toISOString();

    // Update existing issues with recheck results
    await this.updateExistingIssues(frameResult.comment_checks, commentIdToIssue, reviewJson, metadata.fileKey);

    // Add new issues if any
    if (frameResult.new_issues && frameResult.new_issues.length > 0) {
      await this.addNewIssues(frameResult.new_issues, frameId, reviewJson, metadata);
    }

    // Count issues by status for history entry
    const issueCounts = countIssuesByStatus(reviewJson.brand_issues, reviewJson.general_issues);

    // Determine history action and summary
    let action: ReviewHistoryAction = ReviewHistoryAction.RECHECK;
    let summary = generateRecheckSummary(issueCounts);

    if (frameResult.new_issues && frameResult.new_issues.length > 0) {
      action = ReviewHistoryAction.NEW_ISSUES_FOUND;
      summary = generateNewIssuesSummary(frameResult.new_issues);
    } else if (issueCounts.fixed > 0 && issueCounts.fixed === issueCounts.total - issueCounts.new) {
      action = ReviewHistoryAction.ISSUES_FIXED;
    } else if (issueCounts.partially_fixed > 0) {
      action = ReviewHistoryAction.ISSUES_PARTIALLY_FIXED;
    }

    return {
      reviewId: review.id,
      updatedReviewJson: reviewJson,
      historyAction: action,
      historySummary: summary,
      historyChanges: generateHistoryChanges(issueCounts, frameResult.new_issues)
    };
  }

  /**
   * Update existing issues with recheck results
   * @param commentChecks Array of comment check results
   * @param commentIdToIssue Map of comment IDs to issues
   * @param reviewJson Review JSON to update
   * @param fileKey Figma file key
   */
  private async updateExistingIssues(
    commentChecks: CommentCheckResult[],
    commentIdToIssue: Map<string, IssueInfo>,
    reviewJson: ReviewJson,
    fileKey: string
  ): Promise<void> {
    for (const check of commentChecks) {
      const commentId = check.comment_id;
      const issueInfo = commentIdToIssue.get(commentId);

      if (!issueInfo) {
        console.warn(`No issue found for comment ID: ${commentId}`);
        continue;
      }

      const { type } = issueInfo;
      const issueArray = type === IssueType.BRAND_ISSUE ? reviewJson.brand_issues : reviewJson.general_issues;
      const issueIndex = issueArray.findIndex((i: BrandIssue | GeneralIssue) => i.figma_comment_id === commentId);

      if (issueIndex === -1) {
        console.warn(`Issue not found in ${type} array for comment ID: ${commentId}`);
        continue;
      }

      // Update the issue status
      issueArray[issueIndex].status = check.check_result.status;
      issueArray[issueIndex].recheck_details = check.check_result.details;

      // Add thread comment to Figma
      const commentText = formatRecheckComment(check.check_result.status, check.check_result.details);
      try {
        await this.figmaService.addThreadComment(
          fileKey,
          commentId,
          commentText
        );
      } catch (error) {
        console.warn(`Error adding thread comment to comment ${commentId}:`, error);
      }
    }
  }

  /**
   * Add new issues to the review JSON
   * @param newIssues Array of new issues
   * @param frameId Frame ID
   * @param reviewJson Review JSON to update
   * @param metadata Figma metadata
   */
  private async addNewIssues(
    newIssues: (BrandIssue | GeneralIssue)[],
    frameId: string,
    reviewJson: ReviewJson,
    metadata: FigmaMetadata
  ): Promise<void> {
    const frameData = metadata.frames.find(f => f.id === frameId);

    if (frameData) {
      // Process each new issue
      for (const newIssue of newIssues) {
        // Add timestamp to the new issue
        newIssue.created_at = new Date().toISOString();
        newIssue.status = IssueStatus.NEW;

        // Create Figma comment for the new issue
        const commentText = formatNewIssueComment(newIssue);
        const commentId = await this.figmaService.addFigmaComment(
          metadata.fileKey,
          frameId,
          commentText,
          newIssue.coordinates,
          frameData.position
        );

        // Store the comment ID in the issue
        newIssue.figma_comment_id = commentId;

        // Add the issue to the appropriate array in reviewJson
        if ('brand_rule_violation' in newIssue) {
          reviewJson.brand_issues.push(newIssue as BrandIssue);
        } else {
          reviewJson.general_issues.push(newIssue as GeneralIssue);
        }
      }
    }
  }

  /**
   * Save updated reviews and create history entries
   * @param processedResults Array of processed recheck results
   * @returns Map of review IDs to updated review JSON
   */
  async saveRecheckResults(processedResults: (ProcessedRecheckResult | null)[]): Promise<Map<string, ReviewJson>> {
    const updatedReviews = new Map<string, ReviewJson>();

    for (const result of processedResults) {
      if (!result) continue;

      const { reviewId, updatedReviewJson, historyAction, historySummary, historyChanges } = result;

      // Update the review in the database
      await prisma.designReview.update({
        where: { id: reviewId },
        data: { reviewJson: updatedReviewJson as any }
      });

      // Create history entry
      await prisma.reviewHistory.create({
        data: {
          designReviewId: reviewId,
          action: historyAction,
          summary: historySummary,
          changes: historyChanges as any, // Cast to any for Prisma JSON field compatibility
          timestamp: new Date()
        }
      });

      updatedReviews.set(reviewId, updatedReviewJson);
    }

    return updatedReviews;
  }

  /**
   * Process a complete recheck operation
   * @param recheckResult Recheck result from AI
   * @param metadata Figma metadata
   * @param frames Frames with design reviews
   * @returns Map of review IDs to updated review JSON
   */
  async processRecheckResult(
    recheckResult: DesignRecheckResult,
    metadata: FigmaMetadata,
    frames: FrameWithReviews[]
  ): Promise<Map<string, ReviewJson>> {
    // Create maps for frame IDs to reviews and comment IDs to issues
    const frameIdToReview = this.createFrameToReviewMap(frames);
    const { commentIdToIssue, frameIdToReviewJson } = this.createCommentMaps(frames);

    // Process each frame recheck result
    const processedResults = await Promise.all(
      recheckResult.recheck_results.map(frameResult =>
        this.processFrameRecheckResult(
          frameResult,
          metadata,
          commentIdToIssue,
          frameIdToReviewJson,
          frameIdToReview
        )
      )
    );

    // Save results to database and create history entries
    return this.saveRecheckResults(processedResults);
  }
}
