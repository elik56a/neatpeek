import { prisma } from "@/services/db/prisma";
import {
  BrandIssue,
  DesignRecheckResult,
  DesignReviewWithFrame,
  FigmaMetadata,
  GeneralIssue,
  HistoryChanges,
  IssueStatus,
  IssueType,
  RecheckReviewJson,
  ReviewHistoryAction,
  ReviewJson
} from "../types";
import { DesignReviewCoreService } from "./design-review-core-service";
import { FrameReviewService } from "./frame-review-service";

/**
 * Service for handling design rechecks
 * This service focuses on rechecking designs and updating review data
 */
export class DesignRecheckService {
  private coreService: DesignReviewCoreService;
  private frameService: FrameReviewService;

  constructor(coreService: DesignReviewCoreService) {
    this.coreService = coreService;
    this.frameService = new FrameReviewService(coreService);
  }

  /**
   * Find frames by Figma file key
   * @param fileKey Figma file key
   * @returns Frames with their most recent design reviews
   */
  async findFramesForFile(fileKey: string): Promise<DesignReviewWithFrame[]> {
    return this.frameService.findFramesByFileKey(fileKey);
  }

  /**
   * Find frames by IDs
   * @param fileKey Figma file key
   * @param frameIds Frame IDs to find
   * @returns Frames with their most recent design reviews
   */
  async findFramesByIds(fileKey: string, frameIds: string[]): Promise<DesignReviewWithFrame[]> {
    return this.frameService.findFramesByIds(fileKey, frameIds);
  }

  /**
   * Create comment maps for recheck
   * @param frames Frames with design reviews
   * @returns Comment maps
   */
  createCommentMaps(frames: DesignReviewWithFrame[]): { commentIdToIssue: Record<string, { issue: BrandIssue | GeneralIssue; type: string; reviewId: string; frameId: string }> } {
    const commentIdToIssue: Record<string, { issue: BrandIssue | GeneralIssue; type: string; reviewId: string; frameId: string }> = {};

    // Process each frame
    for (const frame of frames) {
      const reviewJson = frame.reviewJson as ReviewJson;
      if (!reviewJson) continue;

      // Process brand issues
      if (reviewJson.brand_issues) {
        for (const issue of reviewJson.brand_issues) {
          if (issue.figma_comment_id) {
            commentIdToIssue[issue.figma_comment_id] = {
              issue,
              type: 'brand',
              reviewId: frame.id,
              frameId: frame.frame.id
            };
          }
        }
      }

      // Process general issues
      if (reviewJson.general_issues) {
        for (const issue of reviewJson.general_issues) {
          if (issue.figma_comment_id) {
            commentIdToIssue[issue.figma_comment_id] = {
              issue,
              type: 'general',
              reviewId: frame.id,
              frameId: frame.frame.id
            };
          }
        }
      }
    }

    return { commentIdToIssue };
  }

  /**
   * Process recheck results
   * @param recheckResult Recheck result from AI
   * @param metadata Figma metadata
   * @param frames Frames with design reviews
   * @returns Updated reviews
   */
  async processRecheckResult(recheckResult: DesignRecheckResult, metadata: FigmaMetadata, frames: DesignReviewWithFrame[]): Promise<Map<string, RecheckReviewJson>> {
    // Convert the frames to the format expected by processRecheckResults
    const frameReviews = frames.map(frame => ({
      id: frame.id,
      frame: frame.frame,
      reviewJson: frame.reviewJson as ReviewJson,
      sessionId: frame.sessionId
    }));

    // Use the processRecheckResults method to process the results
    const updatedFrameReviews = await this.processRecheckResults(
      frameReviews[0].sessionId,
      metadata,
      frames,
      recheckResult
    );

    // Convert the updated frame reviews to a map
    const updatedReviews = new Map<string, RecheckReviewJson>();
    for (const review of updatedFrameReviews) {
      updatedReviews.set(review.id, review.reviewJson as RecheckReviewJson);
    }

    return updatedReviews;
  }

  /**
   * Prepare comment data for recheck directly from frame reviews
   * @param frameReviews Frame reviews to prepare comments for
   * @returns Comments grouped by frame
   */
  prepareCommentsByFrame(frameReviews: DesignReviewWithFrame[]): Record<string, { comment_id: string; message: string; issue_type: string; original_issue: BrandIssue | GeneralIssue }[]> {
    const commentsByFrame: Record<string, { comment_id: string; message: string; issue_type: string; original_issue: BrandIssue | GeneralIssue }[]> = {};

    frameReviews.forEach(frameReview => {
      const reviewJson = frameReview.reviewJson as ReviewJson;
      const frameId = frameReview.frame.frameId;

      // Collect all issues with comment IDs
      const issues = [
        ...(reviewJson.brand_issues || []),
        ...(reviewJson.general_issues || [])
      ].filter(issue => issue.figma_comment_id);


      commentsByFrame[frameId] = issues.map(issue => ({
        comment_id: issue.figma_comment_id!,
        message: issue.description,
        issue_type: 'brand_rule_violation' in issue ? IssueType.BRAND_ISSUE : IssueType.GENERAL_ISSUE,
        original_issue: issue
      }));
    });



    return commentsByFrame;
  }

  /**
   * Process recheck results and update frame reviews
   * @param sessionId Session ID
   * @param metadata Figma metadata
   * @param frameReviews Frame reviews to update
   * @param recheckResult Recheck result from AI
   * @returns Updated frame reviews
   */
  async processRecheckResults(
    sessionId: string,
    metadata: FigmaMetadata,
    frameReviews: DesignReviewWithFrame[],
    recheckResult: DesignRecheckResult
  ) {
    const updatedFrameReviews = [];
    const { formatBrandIssueComment, formatGeneralIssueComment } = await import('../utils');
    const figmaService = this.coreService.getFigmaService();

    // Create a mapping from frameId to frame review
    const frameIdToReview: Record<string, DesignReviewWithFrame> = {};
    frameReviews.forEach(review => {
      frameIdToReview[review.frame.frameId] = review;
    });

    // Process each frame recheck result
    for (const frameResult of recheckResult.recheck_results) {
      const frameId = frameResult.frame_id;
      const frameReview = frameIdToReview[frameId];

      if (!frameReview) {
        console.warn(`No frame review found for frame ID: ${frameId}`);
        continue;
      }

      // Get the current review JSON and convert it to RecheckReviewJson
      const reviewJson = { ...(frameReview.reviewJson as ReviewJson) } as RecheckReviewJson;

      // Initialize counters
      let fixedCount = 0;
      let partiallyFixedCount = 0;
      let notFixedCount = 0;
      let newIssuesCount = 0;

      // Update existing issues with recheck results
      for (const checkResult of frameResult.comment_checks) {
        // Find the issue in either brand_issues or general_issues
        const issueType = checkResult.issue_type === IssueType.BRAND_ISSUE ? 'brand_issues' : 'general_issues';
        const issueIndex = reviewJson[issueType]?.findIndex(
          (issue: BrandIssue | GeneralIssue) => issue.figma_comment_id === checkResult.comment_id
        );

        if (issueIndex !== undefined && issueIndex !== -1) {
          // Update the issue with the check result
          reviewJson[issueType][issueIndex].status = checkResult.check_result.status;
          reviewJson[issueType][issueIndex].recheck_details = checkResult.check_result.details;
          reviewJson[issueType][issueIndex].last_checked = new Date().toISOString();

          // Update counters
          if (checkResult.check_result.status === IssueStatus.FIXED) {
            fixedCount++;
          } else if (checkResult.check_result.status === IssueStatus.PARTIALLY_FIXED) {
            partiallyFixedCount++;
          } else {
            notFixedCount++;
          }

          // Add thread comment to Figma
          const commentText = this.formatRecheckComment(checkResult.check_result.status, checkResult.check_result.details);
          try {
            await figmaService.addThreadComment(
              metadata.fileKey,
              checkResult.comment_id,
              commentText
            );
          } catch (error) {
            console.warn(`Error adding thread comment to comment ${checkResult.comment_id}:`, error);
          }
        }
      }

      // Add new issues
      if (frameResult.new_issues && frameResult.new_issues.length > 0) {
        // Get frame data for Figma comments
        const frameMetadata = metadata.frames.find(f => f.id === frameId);

        for (const newIssue of frameResult.new_issues) {
          // Add timestamp and status
          newIssue.discovered_at = new Date().toISOString();
          newIssue.status = IssueStatus.NEW;

          // Add Figma comment for the new issue
          if (frameMetadata) {
            // Format comment text based on issue type
            let commentText = '';
            if ('brand_rule_violation' in newIssue) {
              commentText = formatBrandIssueComment(newIssue as BrandIssue);
            } else {
              commentText = formatGeneralIssueComment(newIssue as GeneralIssue);
            }

            // Add a prefix for new issues
            commentText = `🆕 NEW ISSUE: ${commentText}`;

            const commentId = await figmaService.addFigmaComment(
              metadata.fileKey,
              frameId,
              commentText,
              newIssue.coordinates,
              frameMetadata.position
            );

            // Store the comment ID
            newIssue.figma_comment_id = commentId;
          }

          // Add to the appropriate array
          if ('brand_rule_violation' in newIssue) {
            reviewJson.brand_issues.push(newIssue as BrandIssue);
          } else {
            reviewJson.general_issues.push(newIssue as GeneralIssue);
          }

          newIssuesCount++;
        }
      }

      // Add summary data to the review JSON
      reviewJson.last_rechecked = new Date().toISOString();
      reviewJson.fixed_issues_count = fixedCount;
      reviewJson.partially_fixed_issues_count = partiallyFixedCount;
      reviewJson.not_fixed_issues_count = notFixedCount;
      reviewJson.new_issues_count = newIssuesCount;

      // Update the frame review in the database
      const updatedFrameReview = await prisma.designReview.update({
        where: { id: frameReview.id },
        data: {
          reviewJson: JSON.parse(JSON.stringify(reviewJson)),
          updatedAt: new Date()
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

      updatedFrameReviews.push(updatedFrameReview);

      // Create frame-specific history entry if there are significant changes
      if (fixedCount > 0 || partiallyFixedCount > 0 || newIssuesCount > 0) {
        let action = ReviewHistoryAction.RECHECK;
        let summary = '';

        if (newIssuesCount > 0) {
          action = ReviewHistoryAction.NEW_ISSUES_FOUND;
          summary = `Found ${newIssuesCount} new issues in frame "${frameReview.frame.name}"`;
        } else if (fixedCount > 0 && notFixedCount === 0) {
          action = ReviewHistoryAction.ISSUES_FIXED;
          summary = `All ${fixedCount} issues fixed in frame "${frameReview.frame.name}"`;
        } else if (fixedCount > 0 || partiallyFixedCount > 0) {
          action = ReviewHistoryAction.ISSUES_PARTIALLY_FIXED;
          summary = `${fixedCount} fixed, ${partiallyFixedCount} partially fixed in frame "${frameReview.frame.name}"`;
        }

        if (summary) {
          await this.coreService.createHistoryEntry({
            sessionId,
            frameId: frameReview.frame.frameId,
            action,
            summary,
            changes: {
              fixed_count: fixedCount,
              partially_fixed_count: partiallyFixedCount,
              not_fixed_count: notFixedCount,
              new_issues_count: newIssuesCount
            } as HistoryChanges
          });
        }
      }
    }

    // Create session-level history entry
    const totalFixedCount = updatedFrameReviews.reduce((sum, review) => {
      const reviewJson = review.reviewJson as RecheckReviewJson;
      return sum + (reviewJson.fixed_issues_count || 0);
    }, 0);

    const totalPartiallyFixedCount = updatedFrameReviews.reduce((sum, review) => {
      const reviewJson = review.reviewJson as RecheckReviewJson;
      return sum + (reviewJson.partially_fixed_issues_count || 0);
    }, 0);

    const totalNotFixedCount = updatedFrameReviews.reduce((sum, review) => {
      const reviewJson = review.reviewJson as RecheckReviewJson;
      return sum + (reviewJson.not_fixed_issues_count || 0);
    }, 0);

    const totalNewIssuesCount = updatedFrameReviews.reduce((sum, review) => {
      const reviewJson = review.reviewJson as RecheckReviewJson;
      return sum + (reviewJson.new_issues_count || 0);
    }, 0);

    // Determine the overall action based on the results
    let action = ReviewHistoryAction.RECHECK;
    let summary = `Rechecked ${updatedFrameReviews.length} frames`;

    if (totalNewIssuesCount > 0) {
      action = ReviewHistoryAction.NEW_ISSUES_FOUND;
      summary = `Found ${totalNewIssuesCount} new issues across ${updatedFrameReviews.length} frames`;
    } else if (totalFixedCount > 0 && totalNotFixedCount === 0 && totalPartiallyFixedCount === 0) {
      action = ReviewHistoryAction.ISSUES_FIXED;
      summary = `All ${totalFixedCount} issues fixed across ${updatedFrameReviews.length} frames`;
    } else if (totalPartiallyFixedCount > 0) {
      action = ReviewHistoryAction.ISSUES_PARTIALLY_FIXED;
      summary = `${totalFixedCount} fixed, ${totalPartiallyFixedCount} partially fixed across ${updatedFrameReviews.length} frames`;
    }

    // Create the session-level history entry
    await this.coreService.createHistoryEntry({
      sessionId,
      action,
      summary,
      changes: {
        fixed_count: totalFixedCount,
        partially_fixed_count: totalPartiallyFixedCount,
        not_fixed_count: totalNotFixedCount,
        new_issues_count: totalNewIssuesCount,
        total_issues_count: totalFixedCount + totalPartiallyFixedCount + totalNotFixedCount + totalNewIssuesCount,
        additional_data: { rechecked_frames_count: updatedFrameReviews.length }
      } as HistoryChanges
    });

    return updatedFrameReviews;
  }

  /**
   * Format recheck comment text
   * @param status Issue status
   * @param details Recheck details
   * @returns Formatted comment text
   */
  private formatRecheckComment(status: IssueStatus, details: string): string {
    const statusEmoji = this.getStatusEmoji(status);
    return `${statusEmoji} **Recheck Result**: ${details}`;
  }

  /**
   * Get emoji for issue status
   * @param status Issue status
   * @returns Emoji for the status
   */
  private getStatusEmoji(status: IssueStatus): string {
    switch (status) {
      case IssueStatus.FIXED:
        return '✅';
      case IssueStatus.PARTIALLY_FIXED:
        return '⚠️';
      case IssueStatus.NOT_FIXED:
        return '❌';
      default:
        return '🔄';
    }
  }
}
