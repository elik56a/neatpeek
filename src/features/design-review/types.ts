/**
 * Types for design review features
 */

/**
 * Position and dimensions of a frame
 */
export interface FramePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Metadata for a Figma frame
 */
export interface FrameMetadata {
  id: string;
  name: string;
  position: FramePosition;
  url: string;
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
 * Placement of a comment on a frame
 */
export interface CommentPlacement {
  x: number;
  y: number;
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

/**
 * Frame image data
 */
export interface FrameImageData {
  id: string;
  url: string;
  type: string;
  position: FramePosition;
}

/**
 * Frame selection state for UI
 */
export interface FrameSelectionState {
  frameId: string;
  name: string;
  imageUrl: string;
  selected: boolean;
}

/**
 * Design analysis result from AI
 */
export interface DesignAnalysisResult {
  reviews: Array<{
    id?: string;
    type: string;
    category: string;
    title: string;
    description: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    position?: {
      x: number;
      y: number;
    };
    elementType?: string;
  }>;
  scores?: {
    overall: number;
    brandCompliance?: number;
    visualHarmony?: number;
    usability?: number;
    accessibility?: number;
  };
}

/**
 * Design recheck result from AI
 */
export interface DesignRecheckResult {
  results?: Array<{
    originalCommentId: string;
    status: 'FIXED' | 'NOT_FIXED' | 'PARTIALLY_FIXED';
    details: string;
  }>;
  recheck_results?: Array<{
    frame_id?: string;
    frame_url?: string;
    comment_checks?: Array<{
      comment_id: string;
      original_message?: string;
      is_fixed: boolean;
      explanation?: string;
    }>;
  }>;
}
