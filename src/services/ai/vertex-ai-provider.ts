/**
 * Implementation of AIService using Google's Vertex AI (Gemini) SDK
 */

// This service is server-side only and should not be imported on the client
import { AIAnalysisResult } from "@/features/brand-setup/types";
import { DesignReviewResult, FrameRecheckResult } from "@/features/design-review/types";
import { VertexAI } from "@google-cloud/vertexai";
import {
  AIService,
  AnalyzeBrandGuidelineParams,
  AnalyzeDesignParams,
  RecheckDesignParams,
} from "./types";

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
    modelName: string = "gemini-2.5-pro-preview-05-06"
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
    // Start with role, goal, and primary instruction
    let prompt = `You are an AI Brand Guideline Analyst. Your task is to meticulously analyze the provided brand materials (PDF, design examples, custom rules) and extract *actionable, specific brand guidelines* relevant to visual design, UI/UX, and brand identity. Structure these guidelines into a precise JSON object suitable for later use in automated design reviews.
    
    *Overall Goal & Rule Categorization:*
    Your goal is to be exhaustive in extracting all actionable rules. You will be asked to categorize rules into the following primary sections based on their most relevant domain:
    •⁠  ⁠metadata: General information about the brand.
    •⁠  ⁠colors: Specific brand color definitions, and gradients  
    •⁠  ⁠typography: Rules for font families, sizes, weights, styles, and usage.
    •⁠  ⁠spacing: Guidelines for margins, paddings, grids, and layout units.
    •⁠  ⁠logo: Rules for logo usage, variations, clear space, and misuses.
    •⁠  ⁠icons: Guidelines for icon style, usage, sizing, and libraries.
    •⁠  ⁠layout: Rules for overall page structure, grid systems, and content organization.
    •⁠  ⁠imagery: Guidelines for photography and illustration styles and usage.
    •⁠  ⁠general: This is a CRITICAL category. It must capture any other specific, actionable visual design, UI/UX, or brand identity rule that does not fit neatly into the more specific categories listed above.
    
    *Analysis Instructions & Source Prioritization:*
    
    1.  *Focus:* Extract rules related to visual elements (colors, fonts, logos, spacing, imagery, icons, layout) and core brand identity aspects (e.g., actionable UI tone of voice keywords, specific UI wording patterns). *Ignore* generic marketing copy, mission statements, company history, generic advice (e.g., "be creative"), or vague statements not specific to this brand's design implementation. Focus on rules that can be objectively checked.
    2.  *Source Types & Handling:*
        * *PDF Brand Book (${params.pdfBuffer ? "Provided" : "Not Provided"}):* If provided, treat this as the *primary source of truth*. Extract explicit rules, definitions, specifications (e.g., exact color codes HEX/RGBA, full font names, specified weights/sizes, logo usage rules with clear space definitions, spacing values/systems).
        * *Design Examples (${params.designImages && params.designImages.length > 0 ? "Provided" : "Not Provided"}):* If provided, analyze these images to *infer visual patterns and implicit rules* ONLY if they are *highly consistent* across multiple examples AND *do not contradict* the PDF or Custom Rules. Use these primarily to supplement or clarify rules found in the PDF. Clearly state in the rule's description if it was 'inferred from examples'. Be very cautious not to invent rules from single or inconsistent instances.
        * *Custom Rules (${params.customRules && params.customRules.length > 0 ? "Provided" : "Not Provided"}):* If provided, these rules *MUST be included* and *take absolute precedence* over any conflicting information found in the PDF or inferred from design examples.
    3.  *Conflict Resolution Hierarchy:* Prioritize sources strictly as: (1st) Custom Rules > (2nd) PDF Brand Book > (3rd) Inferred from Design Examples. If conflicts arise, adhere to the higher priority source.
    4.  *Exhaustive Extraction & "General" Category Mandate:* Ensure that every actionable visual guideline identified from the source materials, according to the prioritization, is included in the final JSON output. *Crucially, if a rule is actionable and relevant to visual design or brand identity but does not perfectly fit one of the specific categories (colors, typography, etc.), it MUST be placed in the 'general' category.* Do not discard relevant rules simply because they are miscellaneous. The 'general' category is vital for capturing these.
    
    *Input Materials Summary:*
    •⁠  ⁠Brand Name: ${params.brandName || "Not explicitly provided, attempt to infer from materials if possible."}
    •⁠  ⁠PDF Brand Book Attached: ${params.pdfBuffer ? "Yes" : "No"}
    •⁠  ⁠Design Examples Attached: ${params.designImages && params.designImages.length > 0 ? "Yes" : "No"}
    •⁠  ⁠Custom Rules Provided: ${params.customRules && params.customRules.length > 0 ? "Yes" : "No"}
    ${params.customRules && params.customRules.length > 0 ? "\n**Custom Rules to Incorporate (Highest Priority):**\n" + params.customRules.map(rule => `- Category: ${rule.category || "general"}, Name: ${rule.name}, Description: ${rule.description}`).join("\n") : ""}
    
    *CRITICAL OUTPUT REQUIREMENTS:*
    
    1.  *Raw JSON Only:* Your entire response MUST be ONLY the raw JSON object. Do NOT include any introductory text, explanations, apologies, or summaries before or after the JSON. Do NOT wrap the JSON in markdown code blocks (\⁠ \ ⁠\⁠ json ... \ ⁠\⁠ \ ⁠) or use any backticks.
    2.  *Strict Schema Adherence:* Adhere strictly to the following JSON structure. Populate the arrays for each category based on the extracted rules. If no rules are found for a category, return an empty array \⁠ []\ ⁠ for it.
    3.⁠ ⁠For every rule listed within arrays like "colors", "typography", etc., you MUST include "name" (string), "value" (string), "description" (string or null), and "confidence" (number between 0 and 1).
    
    \⁠ \ ⁠\`json
    {
      "metadata": {
        "companyName": "string | null", // Use provided brandName. If not provided, infer companyName from materials if clearly stated. Do not guess industry unless explicitly specified.
        "industry": "string | null"
      },
      "colors": [
        {
          "confidence": number, // REQUIRED: Confidence score between 0 and 1.
          "name": "string", // REQUIRED: Clear, concise, human-readable name (e.g., "Primary Action Blue").
          "value": "string", // REQUIRED: The color code (e.g., "#005AEE", "rgba(0, 90, 238, 0.75)").
          "description": "string | null" // e.g., "Main CTA buttons", "Secondary text". Note if inferred.
        }
      ],
      "typography": [
        {
          "confidence": number, // REQUIRED
          "name": "string", // REQUIRED: (e.g., "H1 Heading", "Body Copy").
          "value": "string", // REQUIRED: Font Family Name (e.g., "Inter", "Roboto Slab").
          "description": "string" // REQUIRED: Detail weights, sizes, line-height, letter-spacing, case, usage. Note if inferred.
        }
      ],
      "spacing": [
        {
          "confidence": number, // REQUIRED
          "name": "string", // REQUIRED: (e.g., "Base Unit", "Standard Page Margin").
          "value": "string", // e.g., "8px", "16px", "2rem"
          "description": "string" // REQUIRED: Detailed rule (e.g., "Base unit for grid", "Default margin between sections"). Note if inferred.
        }
      ],
      "logo": [
        {
          "confidence": number, // REQUIRED
          "name": "string", // REQUIRED: (e.g., "Primary Logo Usage", "Clear Space Requirement").
          "value": "string", // e.g., "Default", "Minimum size 32px"
          "description": "string" // REQUIRED: Detailed rule (e.g., "Maintain clear space equal to logo's height", "Never distort"). Note if inferred.
        }
      ],
      "icons": [
        {
          "confidence": number, // REQUIRED
          "name": "string", // REQUIRED: (e.g., "Icon Style", "Functional Icon Sizing").
          "value": "string", // e.g., "Line style, 2px stroke", "24x24px"
          "description": "string" // REQUIRED: Detailed rule (e.g., "Use outlined icons from Material Symbols", "Icons inherit text color"). Note if inferred.
        }
      ],
      "layout": [
        {
          "confidence": number, // REQUIRED
          "name": "string", // REQUIRED: (e.g., "Grid System", "Max Content Width").
          "value": "string", // e.g., "12-column responsive grid", "1280px"
          "description": "string" // REQUIRED: Detailed rule (e.g., "12-column grid with 24px gutters", "Max content width is 1280px for desktop"). Note if inferred.
        }
      ],
      "imagery": [
        {
          "confidence": number, // REQUIRED
          "name": "string", // REQUIRED: (e.g., "Photography Style", "Illustration Usage").
          "value": "string", // e.g., "Authentic, natural light", "Flat style, brand colors only"
          "description": "string" // REQUIRED: Detailed rule (e.g., "Photography should feature real people", "Avoid generic stock photos"). Note if inferred.
        }
      ],
      "general": [
        // CRITICAL REMINDER: This 'general' section is ESSENTIAL. It MUST capture any other specific, actionable visual design, UI/UX, or brand identity rule that does not logically fit into the more narrowly defined categories above (colors, typography, logo, etc.). Examples include, but are not limited to: rules for UI tone of voice (e.g., "Use active voice in UI text"), specific Call-To-Action phrasings (e.g., "Submit buttons must say 'Complete' not 'Send'"), basic accessibility reminders if not extensive enough for their own rules (e.g., "Ensure all interactive elements have hover states"), simple animation/transition notes (e.g., "UI transitions should be subtle and quick"), or any other miscellaneous but objective design constraint. Do not omit relevant rules; if they are actionable and don't fit elsewhere, they belong here.
        {
          "confidence": number, // REQUIRED
          "name": "string", // REQUIRED: Clear, concise, human-readable name (e.g., "UI Tone Principle", "Standard Modal Transition", "Data Table Styling").
          "value":  "string", // e.g., "Friendly, helpful, concise", "Fade-in, 300ms", "Zebra-striping for readability"
          "description": "string" // REQUIRED: Detailed rule (e.g., "UI text should avoid jargon and be encouraging", "Modals always use a gentle fade-in transition over 300ms.", "Alternating row colors for data tables to improve scannability."). Note if specified or inferred.
        }
      ]
    }
    \⁠ \ ⁠\`
    
    3.  *Completeness & Accuracy:* Extract ALL relevant rules accurately and be precise. Do not miss details, especially regarding typography specifications (font name, weights, sizes, line height), exact color codes, and logo clear space requirements. Ensure the final output is valid JSON.
    4.  *No Guessing:* Do not include rules you are unsure about or that are not explicitly stated or clearly and consistently inferred from multiple examples. If a specific detail (like a font weight) isn't mentioned, do not invent it. Just state what is mentioned.
    `;

    return prompt;
  }

  // The rest of the VertexAIProvider class (analyzeDesigns, buildDesignAnalysisPrompt, recheckDesigns, buildDesignRecheckPrompt, cleanJsonResponse) would remain as previously defined or as per your latest version.

  /**
   * Build the prompt for design analysis
   */
  private buildDesignAnalysisPrompt(params: AnalyzeDesignParams): string {
    return `You are an expert design reviewer specializing in brand compliance analysis. Your primary objective is to meticulously evaluate the provided design frame(s) against the specific brand guidelines detailed in the \`brandRules\` JSON below, identifying **all** deviations. Secondary objectives include identifying general UI/UX best practices, accessibility considerations, and overall visual harmony.

    **MAIN OBJECTIVE: Identify Brand Guideline Violations**
    Strictly enforce the provided \`brandRules\` JSON. Analyze for deviations in all categories defined within it, including but not limited to:
    - Colors: Correct usage of brand palettes specified.
    - Typography: **Critical:** Strict adherence to specified font families, sizes, weights, line heights, etc.
    - Logo: Correct usage, clear space, placement, and version.
    - Tone and Voice: Consistency with brand guidelines if specified in \`brandRules\`.
    - Imagery & Visual Style: Alignment with brand aesthetics and guidelines from \`brandRules\`.
    - Spacing & Layout: Compliance with brand-specific rules (e.g., margins, padding, grids) from \`brandRules\`.
    - Icons & Components: Correct usage as defined in \`brandRules\`.

    **ANALYSIS FOR EACH IMAGE FRAME:**
    Perform the following analysis, prioritizing #1:
    1.  **Brand Guideline Violations (Primary Focus):** Identify every deviation from the provided \`brandRules\` JSON object (this includes rules listed under *all* categories within that JSON, such as 'colors', 'typography', 'logo', and even 'general' if present). Report these in the \`brand_issues\`
    1.2 *Minimize False Positives & Focus on Impact:* Your primary goal for identifying \⁠ brand_issues\ ⁠ is to flag clear, unambiguous violations that genuinely detract from brand consistency, user experience, or legibility.
    * *High Confidence Required:* If you are not highly confident about a rule violation (e.g., if precise font details are obscured in the image, or if an element's exact color/size is difficult to determine with certainty), *do not report it as a \⁠ brand_issue\ ⁠*. It's better to miss a potential minor issue than to report a false positive.
    * *Tolerance for Minor, Imperceptible Variations:* For quantifiable rules from \⁠ brandRules\ ⁠ (like specific color hex codes, spacing values, or font sizes), allow for very minor deviations that are highly unlikely to be perceptible to an end-user or to negatively impact the design's overall adherence to the brand. For instance:
    * A color that is visually almost identical (e.g., a difference of only a few units in R, G, or B values, or an extremely similar hex code) to a specified brand color might not need to be flagged, especially for non-critical elements.
    * A 1-2 pixel difference in spacing or sizing, especially if the element is generally compliant and the deviation isn't visually jarring, can often be tolerated.
    * *Prioritize Significance & Impact:* Before flagging a \⁠ brand_issue\ ⁠, briefly consider its actual impact. Is the deviation on a prominent brand element (e.g., main logo, primary call-to-action button) or a less critical one? Would an average user clearly notice this deviation and would it dilute the brand's intended presentation? Focus on issues that are clearly noticeable and strategically important for brand representation. Issues that are technically violations but have negligible visual or experiential impact should be deprioritized for flagging.
    1.3 **Be specific**: If a rule is violated, be specific about the violation. For example, if the color is wrong, specify the color that was used and the correct color according to the brand rules.
    1.4 **Be precise**: If a rule is violated, be precise about the violation. For example, if the font is wrong, specify the font that was used and the correct font according to the brand rules.
    1.5 **Dont return long explanations**: I dont want long explanations. Just return the violation and the fix suggestion. strict and concise.
    2.  **General Design Issues (Secondary Focus):** Identify issues related to usability, interaction, accessibility (e.g., contrast, touch target size if assessable), and visual harmony/aesthetics that are **not** direct violations of the rules defined in the provided \`brandRules\` JSON. These issues relate to **common, established design best practices**. Report these findings in the \`general_issues\` array.
    3.  **Positive Aspects (Secondary Focus):** Briefly note elements that are well-executed or strongly align with the brand/good design principles. Report these in the \`positive_aspects\` array.

    **COORDINATE SYSTEM:**
    Use relative coordinates (0.0 to 1.0) for issue locations, where (0,0) is top-left and (1,1) is bottom-right. Place coordinates accurately near the relevant element. Avoid clustering multiple distinct issues at the exact same point. Example for a 1280x720 frame: Center is x=0.5, y=0.5.

    **INPUT DATA:**

    Here are the image frames to analyze:
    ${params.metadata.frames
      .map(
        frame => `
    Frame URL: ${frame.url}
    Frame ID: ${frame.id}
    Frame Size: ${frame.position.width}x${frame.position.height}
    `
      )
      .join("\n")}

    Here are the specific brand rules (JSON format) to enforce:
    ${JSON.stringify(params.brandRules, null, 2)}

    **SEVERITY ASSIGNMENT LOGIC:**
    Assign severity based on the following:
    - \`high\`: Any violation of the provided \`brandRules\` that significantly impacts brand identity or consistency (e.g., wrong logo, wrong primary color). **EXCEPTION:** Typography violations are always \`medium\`.
    - \`medium\`: Violations of \`brandRules\`
    - \`low\`: Minor UI/UX, Accessibility, or Aesthetic issues (reported in \`general_issues\`). Suggestions for improvement rather than clear errors.
    - \`optional\`: Use only if you are uncertain whether something constitutes an issue or if it's a highly subjective suggestion.

    **DE-DUPLICATION:**
    If an issue qualifies as both a \`brand_issue\` and a \`general_issue\`, report it ONLY as a \`brand_issue\`. Do not report the same finding in both arrays.

    **DESIGN SCORE LOGIC:**
    Don't be mean in the score you give the designer, he should like our app. Be reasonable but with a slight bias towards a higher score, Find the optimal balance and be sensible.

    **CRITICAL OUTPUT REQUIREMENTS:**
    1.  **Raw JSON Only:** Respond with ONLY the raw JSON object. Do NOT wrap it in markdown code blocks (\`\`\`json ... \`\`\`) or use any other surrounding text.
    2.  **No Internal IDs:** NEVER include internal database IDs or cryptic identifiers. For \`brand_rule_violation\`, use only the human-readable rule \`name\` exactly as provided in the input \`brandRules\` JSON.
    3.  **Actionable Suggestions:** For *every* issue listed in \`brand_issues\` and \`general_issues\`, the \`fix_suggestion\` field MUST contain a specific, actionable recommendation. Do not leave it empty or provide vague suggestions like "Fix this".
    4.  **Coordinates:** Ensure all \`coordinates\` (x, y) are relative values between 0.0 and 1.0.
    5.  **Schema Adherence:** Strictly adhere to the following JSON schema structure:

    \`\`\`
    [
        {
          "image": {
            "url": "string", // From input frame data
            "name": "string", // Consider adding frame name if available in params.metadata.frames
            "description": "string", // Optional: AI could generate brief image description
            "screen_type": "string", // Optional: Include if available in params
            "platform": "string", // Optional: Include if available in params
            "frame_id": "string", // CRITICAL: Must match input frame ID
            "position": { // Copied from input metadata
              "x": number,
              "y": number,
              "width": number,
              "height": number
            }
          },
          "brand_issues": [
            {
              "element_type": "string", // e.g., 'Button', 'Text', 'Logo', 'Image'
              "description": "string", // Concise description of the issue found
              "brand_rule_violation": "string", // REQUIRED: The 'name' of the violated rule from brandRules JSON
              "fix_suggestion": "string", // Specific, actionable fix REQUIRED
              "severity": "high" | "medium", // Per logic above (Typo=medium, others usually high)
              "coordinates": { "x": number, "y": number } // Relative 0.0-1.0 REQUIRED
            }
          ],
          "general_issues": [
            {
              "element_type": "string",
              "description": "string",
              "issue": "string", // Type of issue, e.g., 'Accessibility', 'UX', 'Alignment', 'Contrast'
              "fix_suggestion": "string", // Specific, actionable fix REQUIRED
              "severity": "low" | "medium" | "high" | "optional", // Per logic above
              "coordinates": { "x": number, "y": number } // Relative 0.0-1.0 REQUIRED
            }
          ],
          "positive_aspects": [ // Keep simpler if AI struggles with detail
            {
              "element_type": "string",
              "description": "string" // Primary positive feedback
            }
          ],
          "design_score": { 
            "total": number, // 0-100 integer
            "max_score": 100,
            "scoring_rationale": "string" //  Ask AI to explain score basis, not a long explanation, just a few lines in simple language
            "areas_to_improve": "string" //  Ask AI to explain areas to improve only if there are areas to improve, not a long explanation, just a few lines in simple language
            "breakdown": {
              "brand_compliance": number, // 0-100 integer
              "visual_harmony": number, // 0-100 integer
              "usability": number,  // 0-100 integer
              "accessibility": number // 0-100 integer  
            }
          }
        }
      ]
    `;
  }

  /**
   * Analyze designs against brand rules
   */
  async analyzeDesigns(params: AnalyzeDesignParams): Promise<DesignReviewResult[]> {
    try {
      // Initialize the AI service
      await this.initialize();

      console.log("Start analyzeDesign with params:", params);

      // Construct the review prompt
      const reviewPrompt = this.buildDesignAnalysisPrompt(params);

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
        return [];
      }
    } catch (error) {
      console.error("Error analyzing design:", error);
      throw error;
    }
  }

  /**
   * Build the prompt for design recheck
   */
  private buildDesignRecheckPrompt(params: RecheckDesignParams): string {
    return `You are an expert design reviewer performing a follow-up analysis. Your primary task is to verify if previously identified issues have been addressed in the current design frame(s) and to identify any new issues by comparing against the provided brand rules. You must also recalculate the design scores.

**TASKS FOR EACH FRAME:**
1.  **Verify Previous Issues:** For each previous comment provided below, meticulously check the *current* design at the specified location. Determine if the issue is \`fixed\`, \`partially_fixed\`, or \`not_fixed\`. Provide clear details explaining your assessment in the \`comment_checks\` array.
2.  *Identify Limited New Issues (Strictly Conditional):* Your primary focus for this recheck is to verify fixes for previously identified issues (Task 1). The identification of 'new_issues' is secondary and strictly limited to the following conditions:
    * *A. Directly Consequential Issues:* You may report a new brand compliance violation (against \⁠ brandRules\ ⁠) or a general design issue if it has been *directly and clearly introduced as an unintended consequence of the user's attempt to fix one of the previously reported comments.* For example, if correcting an alignment for Comment X inadvertently creates a new spacing violation with an adjacent element that was previously fine.
    * *B. Issues in Genuinely New or Substantially Altered Unrelated Elements:* You may report new issues if you can confidently determine that the user has *added entirely new design content/elements OR made substantial modifications to existing elements that were *not the subject of previous comments AND are clearly distinct from the areas that were fixed.** For example, if the user added a completely new footer section that wasn't there before.
    * *CRITICAL CONSTRAINT FOR NEW ISSUES:* *You MUST NOT re-evaluate or flag issues on aspects of the design that were present in the initial review and were *not flagged with a comment at that time, UNLESS they fall under condition A or B above.** The initial review is considered to have been comprehensive for the design's state at that point. Avoid raising issues now that could have been identified in the first pass but weren't.
    * When reporting any issue in the \⁠ new_issues\ ⁠ array, ensure its \⁠ description\ ⁠ or a dedicated field clearly states why it qualifies as a new issue (e.g., "Consequence of fixing original comment ID 'abc'," or "Issue found in newly added user profile section"). Use the same severity logic for these new issues as defined in the initial 'analyzeDesign' review.
3.  **Recalculate Scores:** Based on the current state (considering fixed previous issues and any new issues), recalculate the design scores (\`total\`, \`brand_compliance\`, \`visual_harmony\`, \`usability\`, \`accessibility\`). Report these in \`updated_scores\`.

**COORDINATE SYSTEM:**
Use relative coordinates (0.0 to 1.0) when specifying locations for any \`new_issues\` found. (0,0) is top-left, (1,1) is bottom-right. Place coordinates accurately near the relevant element.

**INPUT DATA:**

Here are the frames and their previous unfixed comments to recheck:
${Object.entries(params.commentsByFrame)
  .map(([frameId, comments]) => {
    const frame = params.metadata.frames.find(f => f.id === frameId);
    // Ensure robust coordinate calculation even if frame data is somehow missing for a comment
    const frameWidth = frame?.position.width;
    const frameHeight = frame?.position.height;
    return `
Frame ID: ${frameId}
Frame Name: ${frame?.name || "N/A"}
Frame Size: ${frameWidth || "N/A"}x${frameHeight || "N/A"}
Previous Comments to Verify:
${(comments as any[])
  .map((c, index) => {
    // Use c.id as the primary identifier if available and stable, otherwise fallback might be needed
    const commentId = c.id || `comment_${index + 1}`;
    const relX =
      frameWidth && c.client_meta?.node_offset?.x != null
        ? c.client_meta.node_offset.x / frameWidth
        : null;
    const relY =
      frameHeight && c.client_meta?.node_offset?.y != null
        ? c.client_meta.node_offset.y / frameHeight
        : null;
    const coords =
      relX !== null && relY !== null
        ? `(at x=${relX.toFixed(2)}, y=${relY.toFixed(2)})`
        : "(original location info missing)";
    return `- Comment ID "${commentId}": ${c.message} ${coords}`;
  })
  .join("\n")}
`;
  })
  .join("\n")}

Here are the brand rules (JSON format) for context and checking new issues:
${JSON.stringify(params.brandRules, null, 2)}

**IMPORTANT CONTEXT:**
- Only analyze and respond about the frames and comments listed above.
- Brand rules are provided for context, verifying fixes against original intent (if applicable), identifying new brand violations, and recalculating scores.
⁠* The recheck should not become a full re-analysis of unchanged parts of the design that were implicitly approved in the first pass.*


**CRITICAL CHECK - ACCURACY:**
Accuracy is paramount. Before marking any issue as \`fixed\`, meticulously verify the change in the design against the original comment's description and intent. Apply the same diligence when identifying any \`new_issues\`.

**CRITICAL OUTPUT REQUIREMENTS:**
1.  **Raw JSON Only:** Respond with ONLY the raw JSON object. Do NOT wrap it in markdown code blocks (\`\`\`json ... \`\`\`) or use any other surrounding text.
2.  **No Internal IDs:** NEVER include internal database IDs or cryptic identifiers. For any new brand rule violations reported in \`new_issues\`, use only the human-readable rule \`name\` exactly as provided in the input \`brandRules\` JSON.
3.  **Schema Adherence:** Strictly adhere to the following JSON schema structure:

\`\`\`json
 [
    {
      "frame_id": "string", // Must match input frame ID
      "frame_url": "string", // Optional: Consider adding frame url if available/useful
      "comment_checks": [
        {
          "comment_id": "string", // REQUIRED: Must match the input Comment ID from the list above
          "original_message": "string", // REQUIRED: The original comment text for reference
          "is_fixed": boolean, // REQUIRED: true if status is 'fixed', false otherwise
          "check_result": {
            "status": "fixed" | "not_fixed" | "partially_fixed", // REQUIRED: Assessment status
            "details": "string", // REQUIRED: Brief explanation of the status (e.g., 'Color now matches brand palette', 'Font weight still incorrect', 'Alignment corrected')
            "remaining_issues": "string" // REQUIRED if status is 'not_fixed' or 'partially_fixed': Describe precisely what still needs work. Empty string if 'fixed'.
          }
        }
      ],
      "new_issues": [ // For issues found during recheck not related to previous comments
        {
          "element_type": "string", // e.g., 'Header', 'Image', 'Form Field'
          "description": "string", // Concise description of the new issue
          "issue_type": "brand" | "general", // REQUIRED: Classify the new issue
          "brand_rule_violation": "string | null", // REQUIRED if issue_type is 'brand'. Use the rule 'name' from brandRules JSON. Null otherwise.
          "fix_suggestion": "string", // Specific, actionable fix REQUIRED
          "severity": "low" | "medium" | "high" | "optional", // REQUIRED: Assign severity using the **exact same logic defined in the initial 'analyzeDesign' review**: Generally, 'high'/'medium' for 'brand' issue_type (with typography violations being 'medium'), and 'medium'/'low'/'optional' for 'general' issue_type based on impact.
          "coordinates": { "x": number, "y": number } // Relative 0.0-1.0 REQUIRED
        }
      ],
      "updated_scores": {
        "total": number, // 0-100 integer
        "max_score": 100,
        "scoring_rationale": "string" //  Ask AI to explain score basis
        "areas_to_improve": "string" // Optional: Ask AI to explain areas to improve only if there are areas to improve
        "breakdown": {
          "brand_compliance": number,  //0-100 integer
          "visual_harmony": number, //0-100 integer
          "usability": number, //0-100 integer
          "accessibility": number //0-100 integer
        }
      }
    }
  ]
`;
  }

  /**
   * Recheck designs against previous comments
   */
  async recheckDesigns(params: RecheckDesignParams): Promise<FrameRecheckResult[]> {
    try {
      // Initialize the AI service
      await this.initialize();

      // Construct the recheck prompt
      const recheckPrompt = this.buildDesignRecheckPrompt(params);

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
        return [];
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
