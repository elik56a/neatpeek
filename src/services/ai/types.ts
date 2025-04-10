/**
 * Types for the AI service
 */

import { AIAnalysisResult } from "@/features/brand-setup/types";
import { DesignAnalysisResult, DesignRecheckResult, FigmaMetadata } from "@/features/design-review/types";

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
  imageParts: any[];
  
  /**
   * Figma metadata
   */
  metadata: FigmaMetadata;
  
  /**
   * Brand rules
   */
  brandRules: any;
}

/**
 * Parameters for rechecking a design
 */
export interface RecheckDesignParams {
  /**
   * Image parts for the AI model
   */
  imageParts: any[];
  
  /**
   * Figma metadata
   */
  metadata: FigmaMetadata;
  
  /**
   * Brand rules
   */
  brandRules: any;
  
  /**
   * Comments grouped by frame
   */
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
  analyzeDesign(params: AnalyzeDesignParams): Promise<DesignAnalysisResult>;
  
  /**
   * Recheck designs against previous comments
   */
  recheckDesign(params: RecheckDesignParams): Promise<DesignRecheckResult>;
}
