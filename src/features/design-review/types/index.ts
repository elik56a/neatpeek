/**
 * Types for the Design Review feature
 */

import { DesignsReview as DesignsReviewType, Design as DesignType } from "@/types";

// Core types are imported in specific files where needed
import {
  ReviewJson,
  BaseIssue,
  BrandIssue,
  GeneralIssue,
  DesignScore,
  ScoreBreakdown,
  FrameImage,
  IssueCoordinates,
  IssueStatus,
  IssueSeverity,
  IssueType,
} from "./review-json";
import { ReviewHistoryAction, HistoryChanges, IssueSummary } from "./review-history";
import { ReviewStatus } from "./review-status";
import { ScoreCategory } from "./score-category";
import { ExportFileType } from "./file-type";

// Re-export the review-json types
export type {
  ReviewJson,
  BaseIssue,
  BrandIssue,
  GeneralIssue,
  DesignScore,
  ScoreBreakdown,
  FrameImage,
  IssueCoordinates,
};

// extend the Design type
//@ts-ignore
export interface Design extends DesignType {
  reviewJson: ReviewJson;
}

//@ts-ignore
export interface DesignsReview extends DesignsReviewType {
  designs: Design[];
}

// Re-export the review-history types
export type { HistoryChanges, IssueSummary };

// Re-export enums (these don't need 'export type' since they're values, not just types)
export {
  IssueStatus,
  IssueSeverity,
  IssueType,
  ReviewHistoryAction,
  ReviewStatus,
  ScoreCategory,
  ExportFileType,
};

/**
 * Frame position in a Figma file
 */
export interface FramePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Metadata for a frame in a Figma file
 */
export interface FrameMetadata {
  id: string;
  name: string;
  position: FramePosition;
  url?: string;
  nodeId?: string;
}

/**
 * Metadata for a Figma file
 */
export interface FigmaMetadata {
  fileKey: string;
  fileName: string;
  extractionDate: string;
  frames: FrameMetadata[];
}

/**
 * Comment placement information
 */
export interface CommentPlacement {
  frameId: string;
  usedPositions: Set<string>;
  frame: FramePosition;
}

// ScoreCategory is now an enum imported from './score-category'

/**
 * Export options for design review
 */
export interface DesignReviewExportOptions {
  fileName: string;
  fileType: ExportFileType;
  includeTimestamp?: boolean;
  includeFigmaFileName?: boolean;
}

/**
 * Export data row for design review
 */
export interface DesignReviewExportRow {
  frame: string;
  frameId: string;
  issueType: string;
  category: string;
  severity: string;
  description: string;
  recommendation: string;
  status: string;
}

/**
 * Review for a single image/frame
 */
export interface DesignReviewResult {
  image: FrameImage;
  brand_issues: BrandIssue[];
  general_issues: GeneralIssue[];
  positive_aspects?: string[];
  design_score: DesignScore;
}

/**
 * Complete analysis result
 */
export interface DesignAnalysisResult {
  reviews: DesignReviewResult[];
  designsReviewId?: string;
  brandId?: string;
  figmaUrl?: string;
  fileName?: string;
}

/**
 * Check result for a comment
 */
export interface CommentCheckResult {
  comment_id: string;
  original_message?: string;
  is_fixed: boolean;
  check_result: {
    status: IssueStatus;
    details: string;
  };
  original_issue?: BaseIssue;
  issue_type?: IssueType;
}

/**
 * Recheck result for a frame
 */
export interface FrameRecheckResult {
  frame_id: string;
  frame_url: string;
  comment_checks: CommentCheckResult[];
  new_issues: (BrandIssue | GeneralIssue)[];
  updated_scores?: DesignScore;
}

/**
 * Complete recheck result
 */
export interface DesignRecheckResult {
  recheck_results: FrameRecheckResult[];
  updatedReview?: ReviewJson;
  designsReviewId?: string;
  brandId?: string;
  figmaUrl?: string;
  fileName?: string;
}

/**
 * Input for design analysis
 */
export interface DesignAnalysisInput {
  figmaUrl?: string;
  images?: File[];
  brandId: string;
  designType?: string;
}

/**
 * Input for design recheck
 */
export interface DesignRecheckInput {
  designsReviewId: string;
  brandId: string;
  userId: string;
  frameIds?: string[];
}

/**
 * Frame selection state
 */
export interface FrameSelectionState {
  frameId: string;
  name: string;
  imageUrl: string;
  selected: boolean;
}

/**
 * Information extracted from a Figma URL
 */
export interface FigmaInfo {
  fileKey: string | null;
  nodeId: string | null;
}

/**
 * Information about a Figma frame
 */
export interface FrameInfo {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox: FramePosition;
}

export interface FrameImageData {
  id: string;
  url: string;
  type: string;
  position: FramePosition;
}

/**
 * Review history entry
 */
export interface ReviewHistoryEntry {
  id: string;
  designReviewId: string;
  action: ReviewHistoryAction;
  summary: string;
  changes?: HistoryChanges;
  timestamp: Date;
}
