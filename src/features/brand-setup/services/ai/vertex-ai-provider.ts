import { VertexAI } from '@google-cloud/vertexai';
import { AIAnalysisResult } from "../../types";
import { AIProvider, AnalyzeBrandGuidelineParams } from "./types";

/**
 * Implementation of AIProvider using Google's Vertex AI (Gemini) SDK
 */
export class VertexAIProvider implements AIProvider {
  private project: string;
  private location: string;
  private modelName: string;
  private vertexAI: VertexAI;
  private generativeModel: any;

  constructor(project: string, location: string = 'us-central1', modelName: string = 'gemini-2.5-pro-exp-03-25') {
    this.project = project;
    this.location = location;
    this.modelName = modelName;
    
    this.vertexAI = new VertexAI({ project, location });
    this.generativeModel = this.vertexAI.getGenerativeModel({
      model: modelName,
    });
  }

  /**
   * Helper function to clean the AI response and extract JSON
   */
  private extractJsonFromResponse(input: string): string {
    // First, try to find JSON between code blocks
    const jsonRegex = /```(?:json)?([\\s\\S]*?)```/;
    const match = input.match(jsonRegex);
    
    if (match && match[1]) {
      // Found JSON in code blocks
      return match[1].trim();
    }
    
    // If no code blocks, try to find the first { and last }
    const firstBrace = input.indexOf('{');
    const lastBrace = input.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return input.substring(firstBrace, lastBrace + 1);
    }
    
    // If all else fails, return the original input
    return input;
  }

  /**
   * Analyze a brand guideline PDF using Vertex AI SDK
   */
  async analyzeBrandGuideline(params: AnalyzeBrandGuidelineParams): Promise<AIAnalysisResult> {
    try {
      // Build the prompt based on available inputs
      let prompt = this.buildPrompt(params);

      // Prepare the request parts
      const parts: any[] = [{ text: prompt }];

      // Add PDF if available
      if (params.pdfBuffer) {
        parts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: params.pdfBuffer.toString('base64'),
          }
        });
      }

      // Add design images if available
      if (params.designImages && params.designImages.length > 0) {
        for (const image of params.designImages) {
          parts.push({
            inlineData: {
              mimeType: image.mimeType,
              data: image.buffer.toString('base64'),
            }
          });
        }
      }

      // Make the API request using the SDK
      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
      });

      const response = await result.response;
      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error('No response from Vertex AI');
      }

      // Extract and parse the JSON response
      console.log('Raw response from Vertex AI:', responseText);
      
      // Extract JSON from the response
      const jsonData = this.extractJsonFromResponse(responseText);
      console.log('Extracted JSON:', jsonData);
      
      try {
        // Try to parse the JSON
        return JSON.parse(jsonData);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('JSON data that failed to parse:', jsonData);
        
        // Return a fallback response
        return {
          metadata: { companyName: params.brandName || 'Unknown' },
          colors: [
            { name: 'Primary Color', value: '#3B82F6', description: 'Default primary color' }
          ],
          typography: [
            { name: 'Heading Font', value: 'Inter', description: 'Default heading font' }
          ],
          general: [
            { name: 'Brand Voice', value: 'Professional', description: 'Default brand voice' }
          ]
        };
      }
    } catch (error) {
      console.error('Failed to analyze brand guideline with Vertex AI:', error);
      throw error;
    }
  }

  /**
   * Build the prompt based on available inputs
   */
  private buildPrompt(params: AnalyzeBrandGuidelineParams): string {
    let prompt = 'Analyze the provided brand materials and create a comprehensive JSON object of brand guidelines.';
    
    if (params.brandName) {
      prompt += ` The brand name is "${params.brandName}".`;
    }
    
    if (params.pdfBuffer) {
      prompt += ' Read the PDF brand book file, understand it deeply, and extract all brand guidelines.';
    }
    
    if (params.designImages && params.designImages.length > 0) {
      prompt += ' Analyze the provided design examples to extract visual design patterns and rules.';
    }
    
    if (params.customRules && params.customRules.length > 0) {
      prompt += ' Incorporate the following custom rules provided by the user:';
      for (const rule of params.customRules) {
        prompt += `\n- Category: ${rule.category}, Name: ${rule.name}, Description: ${rule.description}`;
      }
    }
    
    prompt += `\n\nPlease return a valid JSON object with the following structure:
    {
      "metadata": {
        "companyName": "...",
        "industry": "..."
      },
      "colors": [
        { "name": "Primary", "value": "#HEXCODE", "description": "..." }
      ],
      "typography": [
        { "name": "Heading Font", "value": "Font Name", "description": "..." }
      ],
      "spacing": [
        { "name": "Base Unit", "value": "8px", "description": "..." }
      ],
      "logo": [
        { "name": "Logo Usage", "value": "...", "description": "..." }
      ],
      "icons": [
        { "name": "Icon Style", "value": "...", "description": "..." }
      ],
      "layout": [
        { "name": "Grid System", "value": "...", "description": "..." }
      ],
      "general": [
        { "name": "Brand Voice", "value": "...", "description": "..." }
      ]
    }
    
    Return only the JSON code without any backticks or markdown formatting. Don't miss any details from the provided materials.`;
    
    return prompt;
  }
}
