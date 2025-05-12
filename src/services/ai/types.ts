/**
 * Types for the AI service
 */

import { AIAnalysisResult, BrandRule } from "@/features/brand-setup/types";
import {
  DesignAnalysisResult,
  DesignRecheckResult,
  DesignReviewResult,
  FigmaMetadata,
  FrameRecheckResult,
} from "@/features/design-review/types";

/**
 * Parameters for analyzing a brand guideline
 */
export interface AnalyzeBrandGuidelineParams {
  /**
   * PDF file as a Buffer
   */
  pdfBuffer?: Buffer;

  /**
   * Design images as Buffers with their MIME types
   */
  designImages?: Array<{
    buffer: Buffer;
    filename?: string;
    mimeType: string;
  }>;

  /**
   * Custom rules provided by the user
   */
  customRules?: Array<{
    category: string;
    name: string;
    description: string;
  }>;

  /**
   * Brand name for context
   */
  brandName?: string;
}

/**
 * Parameters for analyzing a design
 */
export interface AnalyzeDesignParams {
  /**
   * Image parts for the AI model
   */
  imageParts: string[];

  /**
   * Figma metadata
   */
  metadata: FigmaMetadata;

  /**
   * Brand rules
   */
  brandRules: Partial<BrandRule>[];
}

/**
 * Parameters for rechecking a design
 */
export interface RecheckDesignParams extends AnalyzeDesignParams {
  commentsByFrame: Record<string, any[]>;
}

/**
 * Interface for AI service
 */
export interface AIService {
  /**
   * Analyze a brand guideline PDF and return structured data
   */
  analyzeBrandGuideline(params: AnalyzeBrandGuidelineParams): Promise<AIAnalysisResult>;

  /**
   * Analyze designs against brand rules
   */
  analyzeDesigns(params: AnalyzeDesignParams): Promise<DesignReviewResult[]>;

  /**
   * Recheck designs against previous comments
   */
  recheckDesigns(params: RecheckDesignParams): Promise<FrameRecheckResult[]>;
}
