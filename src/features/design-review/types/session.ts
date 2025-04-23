/**
 * Types for the Design Review Session
 */
import { ReviewHistoryAction, ReviewStatus } from '@prisma/client';

/**
 * Design Review Session
 * Represents a complete review session for a Figma file
 */
export interface DesignReviewSession {
  id: string;
  userId: string;
  brandGuidelineId: string;
  figmaUrl: string;
  figmaFileKey: string;
  figmaFileName: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Design Review Session with related data
 */
export interface DesignReviewSessionWithRelations extends DesignReviewSession {
  frameReviews?: DesignReviewWithFrame[];
  history?: SessionHistoryEntry[];
}

/**
 * Design Review for a specific frame
 */
export interface DesignReview {
  id: string;
  sessionId: string;
  frameId: string;
  reviewJson: any; // Will be typed as ReviewJson
  designScore: number;
  designScoreMax: number;
  brandComplianceScore?: number;
  visualHarmonyScore?: number;
  usabilityScore?: number;
  accessibilityScore?: number;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Design Review with Frame data
 */
export interface DesignReviewWithFrame extends DesignReview {
  frame: {
    id: string;
    frameId: string;
    name: string;
    imageUrl: string;
    figmaFileKey: string;
    figmaFileName: string;
  };
}

/**
 * Session History Entry
 */
export interface SessionHistoryEntry {
  id: string;
  sessionId: string;
  frameId?: string;
  action: ReviewHistoryAction;
  summary: string;
  changes?: any; // Will be typed as HistoryChanges
  timestamp: Date;
}

/**
 * Session API response format
 */
export interface SessionApiResponse {
  sessionId: string;
  brandId: string;
  figmaUrl: string;
  fileName: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
  frameReviews: {
    id: string;
    sessionId: string;
    frameId: string;
    reviewJson: any;
    designScore: number;
    designScoreMax: number;
    brandComplianceScore: number;
    visualHarmonyScore: number;
    usabilityScore: number;
    accessibilityScore: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string | null;
    frame: {
      id: string;
      frameId: string;
      name: string;
      imageUrl: string;
      figmaFileKey: string;
      figmaFileName: string;
    };
  }[];
  history?: SessionHistoryEntry[];
}

/**
 * Input for creating a new design review session
 */
export interface CreateSessionInput {
  userId: string;
  brandGuidelineId: string;
  figmaUrl: string;
  figmaFileKey: string;
  figmaFileName: string;
}

/**
 * Input for session-based design analysis
 */
export interface SessionAnalysisInput {
  figmaUrl: string;
  brandId: string;
  userId: string;
  selectedFrameIds?: string[];
}

/**
 * Input for session-based design recheck
 */
export interface SessionRecheckInput {
  sessionId: string;
  frameIds: string[];
  userId: string;
}

/**
 * Result of a session-based design analysis
 */
export interface SessionAnalysisResult {
  sessionId: string;
  brandId: string;
  figmaUrl: string;
  fileName: string;
  frameReviews: DesignReviewWithFrame[];
}

/**
 * Result of a session-based design recheck
 */
export interface SessionRecheckResult {
  sessionId: string;
  brandId: string;
  figmaUrl: string;
  fileName: string;
  updatedFrameReviews: DesignReviewWithFrame[];
  historyEntry: SessionHistoryEntry;
}
