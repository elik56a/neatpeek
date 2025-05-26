/**
 * TypeScript interfaces for the reviewJson structure
 * These interfaces define the shape of the data stored in the reviewJson field of the DesignReview model
 */

import { RuleCategory } from "@/features/brand-setup/types";

/**
 * Enum for issue status
 */
export enum IssueStatus {
  NEW = "new",
  FIXED = "fixed",
  NOT_FIXED = "not_fixed",
  PARTIALLY_FIXED = "partially_fixed",
}

/**
 * Enum for issue severity
 */
export enum IssueSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  OPTIONAL = "optional",
}

/**
 * Enum for issue type
 */
export enum IssueType {
  BRAND_ISSUE = "brand_issue",
  GENERAL_ISSUE = "general_issue",
}

/**
 * Interface for issue coordinates in the design
 */
export interface IssueCoordinates {
  x: number;
  y: number;
}

/**
 * Base interface for all issues
 */
export interface BaseIssue {
  description: string;
  fix_suggestion: string;
  severity: IssueSeverity;
  coordinates: IssueCoordinates;
  figma_comment_id?: string; // ID of the comment in Figma
  status?: IssueStatus; // Status of the issue (for rechecks)
  recheck_details?: string; // Additional details from recheck
  created_at?: string; // ISO timestamp when the issue was created
  element_type?: string; // Type of element (e.g., "Button", "Text", "Image")
  category?: RuleCategory;
}

/**
 * Interface for brand-specific issues
 */
export interface BrandIssue extends BaseIssue {
  brand_rule_violation: string; // The specific brand rule that was violated
}

/**
 * Interface for general design issues
 */
export interface GeneralIssue extends BaseIssue {
  issue_type: string; // Type of general issue (e.g., usability, accessibility)
}

/**
 * Interface for positive aspects
 */
export interface PositiveAspect {
  description: string; // Description of the positive aspect
  element_type: string; // Type of element (e.g., "Button", "Text", "Image")
}
/**
 * Interface for score breakdown
 */
export interface ScoreBreakdown {
  brand_compliance: number;
  visual_harmony: number;
  usability: number;
  accessibility: number;
}

/**
 * Interface for design score
 */
export interface DesignScore {
  total: number;
  max_score: number;
  breakdown: ScoreBreakdown;
  scoring_rationale: string;
  areas_to_improve: string;
}

/**
 * Interface for frame image metadata
 */
export interface FrameImage {
  frame_id: string;
  name: string;
  url: string;
  screen_type?: string;
  platform?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Main interface for the reviewJson structure
 */
export interface ReviewJson {
  image: FrameImage;
  brand_issues: BrandIssue[];
  general_issues: GeneralIssue[];
  design_score: DesignScore;
  positive_aspects?: PositiveAspect[];
  summary?: string;
  created_at: string; // ISO timestamp
  updated_at?: string; // ISO timestamp for rechecks
}
