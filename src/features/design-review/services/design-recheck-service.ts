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

import { prisma } from "@/services/db/prisma";
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
  HistoryChanges,
  Design,
} from "../types";
import { FigmaService } from "./figma-service";
import {
  countIssuesByStatus,
  generateHistoryChanges,
  generateNewIssuesSummary,
  generateRecheckSummary,
} from "../utils/history-formatters";
import { formatNewIssueComment, formatRecheckComment } from "../utils/comment-formatters";

/**
 * Interface for issue information
 */
interface IssueInfo {
  issue: BrandIssue | GeneralIssue;
  type: IssueType;
  designId: string;
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
  designId: string;
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
   * @returns Array of frames with their most recent designs
   */
  async findDesignsForFile(fileKey: string): Promise<Design[]> {
    const designs = await prisma.design.findMany({
      where: {
        designsReview: {
          figmaFileId: fileKey,
        },
      },
      include: {
        user: true,
        designsReview: true,
      },
    });

    if (designs.length === 0) {
      throw new Error("No designs found for this Figma file. Please run an initial review first.");
    }

    return designs;
  }

  /**
   * Find specific Designs in the database by their IDs
   * @param fileKey Figma file key
   * @param frameIds Array of frame IDs to find
   * @returns Array of frames with their most recent designs
   */
  async findDesignsByIds(fileKey: string, designIds: string[]): Promise<Design[]> {
    const designs = await prisma.design.findMany({
      where: {
        id: {
          in: designIds,
        },
      },
      include: {
        user: true,
        designsReview: true,
      },
    });

    if (designs.length === 0) {
      throw new Error(
        "No designs found for the specified design IDs. Please run an initial review first."
      );
    }

    return designs;
  }

  /**
   * Create a map of frame IDs to their most recent designs
   * @param frames Array of frames with designs
   * @returns Map of frame IDs to designs
   */
  createFrameToDesignMap(designs: Design[]): Record<string, Design> {
    return designs.reduce<Record<string, Design>>((map, design) => {
      if (design?.frameId) {
        map[design?.frameId] = design;
      }
      return map;
    }, {});
  }

  /**
   * Create maps for comment IDs to issues and frame IDs to review JSON
   * @param frames Array of frames with designs
   * @returns Maps for comment IDs and review JSON
   */
  createCommentMaps(designs: Design[]): CommentMaps {
    const commentIdToIssue = new Map<string, IssueInfo>();
    const frameIdToReviewJson = new Map<string, ReviewJson>();

    for (const design of designs) {
      const reviewJson = design.reviewJson as ReviewJson;
      frameIdToReviewJson.set(design.frameId, reviewJson);

      // Process brand issues
      if (reviewJson.brand_issues) {
        for (const issue of reviewJson.brand_issues) {
          if (issue.figma_comment_id) {
            commentIdToIssue.set(issue.figma_comment_id, {
              issue,
              type: IssueType.BRAND_ISSUE,
              designId: design.id,
              frameId: design.frameId,
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
              designId: design.id,
              frameId: design.frameId,
            });
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
  async prepareCommentsByFrame(
    fileKey: string,
    commentIdToIssue: Map<string, IssueInfo>
  ): Promise<Record<string, any[]>> {
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
   * @param frameIdToDesign Map of frame IDs to designs
   * @returns Processed result with updated review and history entry
   */
  private async processFrameRecheckResult(
    frameResult: FrameRecheckResult,
    metadata: FigmaMetadata,
    commentIdToIssue: Map<string, IssueInfo>,
    frameIdToReviewJson: Map<string, ReviewJson>,
    frameIdToDesign: Record<string, Design>
  ): Promise<ProcessedRecheckResult | null> {
    const frameId = frameResult.frame_id;
    const reviewJson = frameIdToReviewJson.get(frameId);
    const design = frameIdToDesign[frameId];

    if (!reviewJson || !design) {
      console.warn(`No review found for frame ${frameId}`);
      return null;
    }

    // Update existing issues
    await this.updateExistingIssues(
      frameResult.comment_checks,
      commentIdToIssue,
      reviewJson,
      metadata.fileKey
    );

    // Add new issues
    await this.addNewIssues(frameResult.new_issues, frameId, reviewJson, metadata);

    // Update scores
    if (frameResult.updated_scores) {
      reviewJson.design_score = frameResult.updated_scores;
    }
    reviewJson.updated_at = new Date().toISOString();

    // Update image properties
    const frameMetadata = metadata.frames.find(f => f.id === frameId);
    if (frameMetadata) {
      reviewJson.image.url = frameMetadata.url;
      reviewJson.image.position = frameMetadata.position;
      reviewJson.image.name = frameMetadata.name;
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
      designId: design.id,
      updatedReviewJson: reviewJson,
      historyAction: action,
      historySummary: summary,
      historyChanges: generateHistoryChanges(issueCounts, frameResult.new_issues),
    };
  }

  /**
   * Update existing issues based on comment checks
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
      const issueInfo = commentIdToIssue.get(check.comment_id);
      if (!issueInfo) continue;

      // update issue status
      const issue = issueInfo.issue;
      issue.status = check.check_result.status;
      issue.recheck_details = check.check_result.details;

      // Update Figma comment if status changed
      const commentText = formatRecheckComment(
        check.check_result.status,
        check.check_result.details
      );
      await this.figmaService.addThreadComment(fileKey, check.comment_id, commentText);
    }
  }

  /**
   * Add new issues to the review
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
    for (const issue of newIssues) {
      // Add comment to Figma
      const commentText = formatNewIssueComment(issue);
      const comment = await this.figmaService.addFigmaComment(
        metadata.fileKey,
        frameId,
        commentText,
        issue.coordinates,
        metadata.frames.find(f => f.id === frameId)?.position
      );

      // Update issue with comment ID
      issue.figma_comment_id = comment;

      // Add to appropriate issues array
      if ("brand_rule_violation" in issue) {
        if (!reviewJson.brand_issues) reviewJson.brand_issues = [];
        reviewJson.brand_issues.push(issue as BrandIssue);
      } else {
        if (!reviewJson.general_issues) reviewJson.general_issues = [];
        reviewJson.general_issues.push(issue as GeneralIssue);
      }
    }
  }

  /**
   * Save recheck results to the database
   * @param processedResults Array of processed recheck results
   * @returns Map of frame IDs to updated review JSON
   */
  async saveRecheckResults(
    processedResults: (ProcessedRecheckResult | null)[]
  ): Promise<Map<string, ReviewJson>> {
    const frameIdToReviewJson = new Map<string, ReviewJson>();

    for (const result of processedResults) {
      if (!result) continue;

      const { designId, updatedReviewJson, historyAction, historySummary, historyChanges } = result;

      // Update design record
      const design = await prisma.design.update({
        where: { id: designId },
        data: {
          reviewJson: updatedReviewJson as any,
        },
      });

      // Create history entry
      await prisma.reviewHistory.create({
        data: {
          designsReviewId: design.designsReviewId,
          action: historyAction,
          summary: historySummary,
          changes: historyChanges as any,
        },
      });

      // Add to map
      frameIdToReviewJson.set(design.frameId, updatedReviewJson);
    }

    return frameIdToReviewJson;
  }

  /**
   * Process a recheck result
   * @param recheckResult Recheck result to process
   * @param metadata Figma metadata
   * @param frames Array of frames with designs
   * @returns Map of frame IDs to updated review JSON
   */
  async processRecheckResult(
    recheckResult: FrameRecheckResult[],
    metadata: FigmaMetadata,
    designs: Design[]
  ): Promise<Map<string, ReviewJson>> {
    // Create maps for comment IDs and review JSON
    const { commentIdToIssue, frameIdToReviewJson } = this.createCommentMaps(designs);

    // Create map of frame IDs to designs
    const frameIdToDesign = this.createFrameToDesignMap(designs);

    if (!recheckResult || recheckResult.length === 0) {
      console.warn("No recheck results to process.");
      return new Map();
    }

    // Process each frame result
    const processedResults = await Promise.all(
      recheckResult?.map(frameResult =>
        this.processFrameRecheckResult(
          frameResult,
          metadata,
          commentIdToIssue,
          frameIdToReviewJson,
          frameIdToDesign
        )
      )
    );

    // Save results to database
    return this.saveRecheckResults(processedResults);
  }
}
