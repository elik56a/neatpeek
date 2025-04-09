import { AIAnalysisResult } from "../../types";

/**
 * Interface for AI service providers
 * This allows us to easily swap out AI providers in the future
 */
export interface AIProvider {
  /**
   * Analyze a brand guideline PDF and return structured data
   */
  analyzeBrandGuideline(params: AnalyzeBrandGuidelineParams): Promise<AIAnalysisResult>;
}

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
