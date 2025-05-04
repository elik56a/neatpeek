/**
 * Implementation of AIService using Google's Vertex AI (Gemini) SDK
 */

// This service is server-side only and should not be imported on the client
import { auth } from "google-auth-library";
import { AIAnalysisResult } from "@/features/brand-setup/types";
import { DesignAnalysisResult, DesignRecheckResult } from "@/features/design-review/types";
import {
  AIService,
  AnalyzeBrandGuidelineParams,
  AnalyzeDesignParams,
  RecheckDesignParams,
} from "./types";
import { VertexAI } from "@google-cloud/vertexai";

export class VertexAIProvider implements AIService {
  private vertexAI: VertexAI;
  private generativeModel: any;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  // Configuration
  private project: string;
  private location: string;
  private modelName: string;

  /**
   * Create a new VertexAIProvider
   * @param project Google Cloud project ID
   * @param location Google Cloud location
   * @param modelName Model name
   */
  constructor(
    project: string,
    location: string = "us-central1",
    modelName: string = "gemini-2.5-pro-exp-03-25"
  ) {
    this.project = project;
    this.location = location;
    this.modelName = modelName;
  }

  /**
   * Initialize the AI service
   * This is done lazily to avoid loading Node.js modules on the client
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.GOOGLE_PROJECT_ID,
          private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          client_id: process.env.GOOGLE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
          universe_domain: "googleapis.com",
        };

        this.vertexAI = new VertexAI({
          project: this.project,
          location: this.location,
          googleAuthOptions: { credentials: serviceAccount },
        });

        this.generativeModel = this.vertexAI.getGenerativeModel({
          model: this.modelName,
        });

        this.isInitialized = true;
      } catch (error) {
        console.error("Error initializing AI service:", error);
        throw error;
      }
    })();

    return this.initPromise;
  }

  // The extractJsonFromResponse method has been replaced by cleanJsonResponse

  /**
   * Analyze a brand guideline PDF using Vertex AI SDK
   */
  async analyzeBrandGuideline(params: AnalyzeBrandGuidelineParams): Promise<AIAnalysisResult> {
    try {
      // Initialize the AI service
      await this.initialize();

      // Build the prompt based on available inputs
      let prompt = this.buildBrandGuidelinePrompt(params);

      // Prepare the request parts
      const parts: any[] = [{ text: prompt }];

      // Add PDF if available
      if (params.pdfBuffer) {
        parts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: params.pdfBuffer.toString("base64"),
          },
        });
      }

      // Add design images if available
      if (params.designImages && params.designImages.length > 0) {
        for (const image of params.designImages) {
          parts.push({
            inlineData: {
              mimeType: image.mimeType,
              data: image.buffer.toString("base64"),
            },
          });
        }
      }

      // Make the API request using the SDK
      const result = await this.generativeModel.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.2,
        },
      });

      const response = await result.response;
      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error("No response from Vertex AI");
      }

      // Extract and parse the JSON response
      console.log("Raw response from Vertex AI:", responseText);

      // Clean the response by removing code block markers
      const cleanedResponse = this.cleanJsonResponse(responseText);

      try {
        // Try to parse the JSON
        return JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        console.error("First 100 chars of response:", cleanedResponse.substring(0, 100));

        // Return a default empty response instead of throwing
        return {
          metadata: { companyName: "Unknown", industry: "Unknown" },
          colors: [],
          typography: [],
          spacing: [],
          general: [],
        };
      }
    } catch (error) {
      console.error("Failed to analyze brand guideline with Vertex AI:", error);
      throw new Error("Failed to analyze brand guideline, please try again.");
    }
  }

  /**
   * Build the prompt for brand guideline analysis
   */
  private buildBrandGuidelinePrompt(params: AnalyzeBrandGuidelineParams): string {
    let prompt =
      "Analyze the provided brand materials and create a comprehensive JSON object of brand guidelines.";

    if (params.brandName) {
      prompt += ` The brand name is "${params.brandName}".`;
    }

    if (params.pdfBuffer) {
      prompt +=
        " Read the PDF brand book file, understand it deeply, and extract all brand guidelines.";
    }

    if (params.designImages && params.designImages.length > 0) {
      prompt +=
        " Analyze the provided design examples to extract visual design patterns and rules.";
    }

    if (params.customRules && params.customRules.length > 0) {
      prompt += " Incorporate the following custom rules provided by the user:";
      for (const rule of params.customRules) {
        prompt += `\n- Category: ${rule.category}, Name: ${rule.name}, Description: ${rule.description}`;
      }
    }

    prompt += `\n\nIMPORTANT: Please return a valid JSON object with the following structure. DO NOT wrap the JSON in code blocks or markdown formatting. DO NOT use backticks around your response. Return ONLY the raw JSON:
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
        { "name": "Tone of Voice", "value": "...", "description": "..." },
        { "name": "Social Media Guidelines", "value": "...", "description": "..." },
      ]
    }

    IMPORTANT: AT THE TYPOGRAPHY SECTION, INCLUDE THE FONT NAME AND WEIGHTS.

    IMPORTANT: Return only the raw JSON without any backticks, code blocks, or markdown formatting. DO NOT use backticks around your response. Do not include any explanations or additional text before or after the JSON. Don't miss any details from the provided materials.`;

    return prompt;
  }

  /**
   * Analyze designs against brand rules
   */
  async analyzeDesign(params: AnalyzeDesignParams): Promise<DesignAnalysisResult> {
    try {
      // Initialize the AI service
      await this.initialize();

      console.log("Start analyzeDesign with params:", params);

      // Construct the review prompt
      const reviewPrompt = `You are a brand compliance and design reviewer specializing in enforcing brand guidelines while ensuring good UX practices. Your primary focus is to ensure strict adherence to the provided brand rules and guidelines.

      MAIN OBJECTIVE: Your primary task is to identify any deviations from or violations of the brand guidelines. This includes but is not limited to:
      - Correct usage of brand colors
      - Typography compliance, including exact font, size, and weight!! very important!!
      - Logo usage and placement
      - Brand voice and messaging
      - Visual style consistency
      - Brand-specific spacing and layout rules
      - Target audience alignment
      - Brand values representation
      - Brand benefits communication
      - Social media guidelines
      - Brand tone and voice consistency


      Secondary objective: Identify general UI/UX and accessibility issues that might affect user experience.

      For each image, analyze:
      1. Brand compliance (PRIMARY FOCUS)
      2. General UI/UX best practices (SECONDARY FOCUS)
      3. Accessibility issues (SECONDARY FOCUS)
      4. Visual harmony and aesthetics (SECONDARY FOCUS)
      5. Positive aspects of the design (SECONDARY FOCUS)

      COORDINATE SYSTEM:
      When specifying coordinates for issues, use relative coordinates within the frame (0 to 1).
      For example, in a 1280x720 frame:
      - Top-left corner: x=0, y=0
      - Center: x=0.5, y=0.5 (640px, 360px in absolute terms)
      - Bottom-right: x=1, y=1 (1280px, 720px in absolute terms)

      Distribute comments logically:
      - Logo issues: Near the actual/expected logo position
      - Typography issues: Near the relevant text
      - Color issues: On or near the affected element
      - Layout issues: Near the problematic area
      - Avoid clustering comments - spread them around the relevant areas

      Here are the images with their frame data:
      ${params.metadata.frames
        .map(frame => {
          return `
        URL: ${frame.url}
        Frame ID: ${frame.id}
        Frame Size: ${frame.position.width}x${frame.position.height}
        `;
        })
        .join("\n")}

      Here are the brand rules:
      ${JSON.stringify(params.brandRules, null, 2)}

      IMPORTANT:
      THE SEVERITY OF THE ISSUES SHOULD BE BASED ON THE BRAND RULES AND GUIDELINES.
      IF THE ISSUE IS A VIOLATION OF A BRAND RULE, THE SEVERITY SHOULD BE HIGH, UNLESS THE ISSUE IS A TYPOGRAPHY ISSUE, THEN THE SEVERITY SHOULD BE MEDIUM.
      IF THE ISSUE IS A VIOLATION OF A GENERAL RULE, THE SEVERITY SHOULD BE MEDIUM.
      IF THE ISSUE IS A VIOLATION OF A GENERAL RULE BUT THE BRAND RULES ARE NOT VIOLATED, THE SEVERITY SHOULD BE LOW.
      IF U DONT SURE IF THE ISSUE IS A VIOLATION OF A BRAND RULE, THE SEVERITY SHOULD BE OPTIONAL.

      IF U CREATED A BRAND ISSUE , AND U SEE ALSO SAME ISSUE IN THE GENERAL ISSUES, THEN U SHOULD REMOVE THE GENERAL ISSUE, WE DONT WANT DUPLICATE ISSUES.

      CRITICAL: NEVER INCLUDE ANY INTERNAL IDs, DATABASE IDs, OR CRYPTIC IDENTIFIERS (like "cm9tzx3ya002h11pmofy7amjo") in your responses. For brand rule violations, use only the rule name/title (e.g., "Logo Usage on Backgrounds" or "Typography Guidelines"). If you don't know the exact rule name, create a descriptive name based on the rule's content.

      IMPORTANT: Return the following JSON schema with frame_id included for each image. DO NOT wrap the JSON in code blocks or markdown formatting. DO NOT use backticks around your response. Return ONLY the raw JSON:
      {
        "reviews": [
          {
            "image": {
              "url": "string",
              "name": "string",
              "description": "string",
              "screen_type": "string",
              "platform": "string",
              "frame_id": "string",
              "position": {
                "x": number,
                "y": number,
                "width": number,
                "height": number
              }
            },
            "brand_issues": [
              {
                "element_type": "string",
                "description": "string",
                "brand_rule_violation": "string", // IMPORTANT: Use only the rule name/title, NOT the rule ID or any internal identifiers
                "fix_suggestion": "string", // IMPORTANT: Must be a specific, actionable suggestion, dont make this empty never
                "severity": "low" | "medium" | "high",
                "coordinates": {
                  "x": number,  // MUST be between 0-1
                  "y": number   // MUST be between 0-1
                }
              }
            ],
            "general_issues": [
              {
                "element_type": "string",
                "description": "string",
                "issue": "string",
                "fix_suggestion": "string",
                "severity": "low" | "medium" | "high" | "optional",
                "coordinates": {
                  "x": number,  // MUST be between 0-1
                  "y": number   // MUST be between 0-1
                }
              }
            ],
            "positive_aspects": [
              {
                "element_type": "string",
                "description": "string",
                "strength": "string",
                "impact": "string",
                "brand_alignment": "string"
              }
            ],
            "design_score": {
              "total": number,
              "max_score": 100,
              "breakdown": {
                "brand_compliance": number,
                "visual_harmony": number,
                "usability": number,
                "accessibility": number
              }
            }
          }
        ]
      }`;

      // Generate AI content
      const result = await this.generativeModel.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: reviewPrompt }, ...params.imageParts],
          },
        ],
      });

      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error("No response from Gemini.");
      console.log("Raw response from Vertex AI:", responseText);

      // Clean the response by removing code block markers
      const cleanedResponse = this.cleanJsonResponse(responseText);

      try {
        return JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError.message);
        console.error("First 100 chars of response:", cleanedResponse.substring(0, 100));

        // Return a default empty response instead of throwing
        return { reviews: [] };
      }
    } catch (error) {
      console.error("Error analyzing design:", error);
      throw error;
    }
  }

  /**
   * Recheck designs against previous comments
   */
  async recheckDesign(params: RecheckDesignParams): Promise<DesignRecheckResult> {
    try {
      // Initialize the AI service
      await this.initialize();

      // Construct the recheck prompt
      const recheckPrompt = `You are a brand compliance and design reviewer performing a follow-up review.
      Your task is to verify if previously identified issues have been properly addressed and recalculate design scores.

      For each frame, I'll provide:
      1. The current design
      2. Previous unfixed comments and their locations

      For each previous comment, determine:
      1. If the issue has been fixed (true/false)
      2. If not fixed, what specifically remains to be addressed
      3. If partially fixed, what improvements have been made and what still needs work

      IMPORTANT: You must also recalculate the design scores based on the current state of the design:
      1. Overall score
      2. Brand compliance score
      3. Visual harmony score
      4. Usability score
      5. Accessibility score

      COORDINATE SYSTEM:
      When specifying coordinates for new issues, use relative coordinates within the frame (0 to 1).
      For example, in a 1280x720 frame:
      - Top-left corner: x=0, y=0
      - Center: x=0.5, y=0.5
      - Bottom-right: x=1, y=1

      Distribute comments logically near the relevant elements and avoid clustering.

      Here are the frames with their previous unfixed comments:
      ${Object.entries(params.commentsByFrame)
        .map(([frameId, comments]) => {
          const frame = params.metadata.frames.find(f => f.id === frameId);
          return `
        Frame ID: ${frameId}
        Frame Name: ${frame?.name}
        Frame Size: ${frame?.position.width}x${frame?.position.height}
        Previous Comments:
        ${(comments as any[])
          .map(c => {
            // Convert absolute coordinates back to relative for context
            const relX = c.client_meta?.node_offset?.x / frame?.position.width;
            const relY = c.client_meta?.node_offset?.y / frame?.position.height;
            return `- ${c.id}: ${c.message} (at x=${relX?.toFixed(2)}, y=${relY?.toFixed(2)})`;
          })
          .join("\n")}
        `;
        })
        .join("\n")}

      Here are the brand rules:
      ${JSON.stringify(params.brandRules, null, 2)}

      IMPORTANT: Only analyze and respond about the frames provided above. Do not comment on any other frames in the file.

      VERY IMPORTANT!!!
      BEFORE SET THE ISSUE TO FIXED, MAKE SURE VERY CAREFULLY CHECK THE DESIGN AND MAKE SURE THE ISSUE IS FIXED. SAME FOR NEW ISSUES.

      CRITICAL: NEVER INCLUDE ANY INTERNAL IDs, DATABASE IDs, OR CRYPTIC IDENTIFIERS (like "cm9tzx3ya002h11pmofy7amjo") in your responses. For brand rule violations, use only the rule name/title (e.g., "Logo Usage on Backgrounds" or "Typography Guidelines"). If you don't know the exact rule name, create a descriptive name based on the rule's content.

      IMPORTANT: Return the following JSON schema. DO NOT wrap the JSON in code blocks or markdown formatting. DO NOT use backticks around your response. Return ONLY the raw JSON:
      {
        "recheck_results": [
          {
            "frame_id": "string",
            "frame_url": "string",
            "comment_checks": [
              {
                "comment_id": "string",
                "original_message": "string",
                "is_fixed": boolean,
                "check_result": {
                  "status": "fixed" | "not_fixed" | "partially_fixed",
                  "details": "string",
                  "remaining_issues": "string"
                }
              }
            ],
            "new_issues": [
              {
                "element_type": "string",
                "description": "string",
                "severity": "low" | "medium" | "high" | "optional",
                "coordinates": {
                  "x": number,  // MUST be between 0-1
                  "y": number   // MUST be between 0-1
                }
              }
            ],
            "updated_scores": {
              "total": number,
              "max_score": 100,
              "breakdown": {
                "brand_compliance": number,
                "visual_harmony": number,
                "usability": number,
                "accessibility": number
              }
            }
          }
        ]
      }`;

      // Generate AI content
      const result = await this.generativeModel.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: recheckPrompt }, ...params.imageParts],
          },
        ],
      });

      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error("No response from Gemini.");

      // Clean the response by removing code block markers
      const cleanedResponse = this.cleanJsonResponse(responseText);

      try {
        return JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError.message);
        console.error("First 100 chars of response:", cleanedResponse.substring(0, 100));

        // Return a default empty response instead of throwing
        return { recheck_results: [] };
      }
    } catch (error) {
      console.error("Error rechecking design:", error);
      throw error;
    }
  }

  /**
   * Simple function to remove code block markers from JSON
   */
  private cleanJsonResponse(input: string): string {
    try {
      console.log("Cleaning JSON response, input length:", input.length);

      // Check if the input starts with ```json and ends with ```
      if (input.trim().startsWith("```json") && input.trim().endsWith("```")) {
        console.log("Found JSON code block, extracting content");
        // Extract everything between the first ``` and the last ```
        return input
          .trim()
          .substring(7, input.trim().length - 3)
          .trim();
      }

      // If no code blocks, just return the input
      return input;
    } catch (e) {
      console.error("Error cleaning JSON response:", e);
      return input; // Return original input if any error occurs
    }
  }
}
