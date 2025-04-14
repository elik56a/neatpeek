/**
 * Types for the Design Review feature
 */

import { FigmaFile, FigmaFrame, DesignReview as CoreDesignReview, FigmaComment } from "@/types";

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

/**
 * Design issue with coordinates
 */
export interface DesignIssue {
  element_type: string;
  description: string;
  brand_rule_violation?: string;
  issue?: string;
  fix_suggestion: string;
  severity: 'low' | 'medium' | 'high';
  coordinates: {
    x: number;
    y: number;
  };
}

/**
 * Positive aspect of a design
 */
export interface PositiveAspect {
  element_type: string;
  description: string;
  strength: string;
  impact: string;
  brand_alignment: string;
}

/**
 * Design score breakdown
 */
export interface DesignScoreBreakdown {
  total: number;
  max_score: number;
  breakdown: {
    brand_compliance: number;
    visual_harmony: number;
    usability: number;
    accessibility: number;
  };
}

/**
 * Score category type
 */
export type ScoreCategory = 'brand_compliance' | 'visual_harmony' | 'usability' | 'accessibility';

/**
 * Severity level for design issues
 */
export type SeverityLevel = 'low' | 'medium' | 'high';

/**
 * Export options for design review
 */
export interface DesignReviewExportOptions {
  fileName: string;
  fileType: 'csv' | 'xlsx';
  includeTimestamp?: boolean;
  includeFigmaFileName?: boolean;
}

/**
 * Export data row for design review
 */
export interface DesignReviewExportRow {
  frame: string;
  issueType: string;
  category: string;
  severity: string;
  description: string;
  recommendation: string;
}

/**
 * Review for a single image/frame
 */
export interface DesignReviewResult {
  image: {
    url: string;
    name: string;
    description: string;
    screen_type: string;
    platform: string;
    frame_id: string;
    position: FramePosition;
  };
  brand_issues: DesignIssue[];
  general_issues: DesignIssue[];
  positive_aspects: PositiveAspect[];
  design_score: DesignScoreBreakdown;
}

/**
 * Complete analysis result
 */
export interface DesignAnalysisResult {
  reviews: DesignReviewResult[];
}

/**
 * Check result for a comment
 */
export interface CommentCheckResult {
  comment_id: string;
  original_message: string;
  is_fixed: boolean;
  check_result: {
    status: 'fixed' | 'not_fixed' | 'partially_fixed';
    details: string;
    remaining_issues: string;
  };
}

/**
 * Recheck result for a frame
 */
export interface FrameRecheckResult {
  frame_id: string;
  frame_url: string;
  comment_checks: CommentCheckResult[];
  new_issues: DesignIssue[];
}

/**
 * Complete recheck result
 */
export interface DesignRecheckResult {
  recheck_results: FrameRecheckResult[];
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
  figmaUrl: string;
  brandId: string;
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
