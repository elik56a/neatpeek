/**
 * AI Service Factory
 *
 * This module provides a singleton instance of the AI service.
 *
 * NOTE: This module should only be imported on the server.
 */

// Re-export types
export * from "./types";

// Singleton instance
let aiServiceInstance: any = null;

/**
 * Get the AI service instance
 * This ensures we only create one instance of the AI service
 */
export async function getAIService() {
  // Check if we're on the server
  if (typeof window !== "undefined") {
    throw new Error("AI Service can only be used on the server");
  }

  if (!aiServiceInstance) {
    // Get the project ID from environment variables
    const project = process.env.GOOGLE_PROJECT_ID || "";
    const location = process.env.GOOGLE_LOCATION || "us-central1";
    const modelName = process.env.GOOGLE_MODEL_NAME || "gemini-2.5-pro-preview-05-06";

    // Dynamically import the VertexAIProvider
    const { VertexAIProvider } = await import("./vertex-ai-provider");

    // Create the AI service
    aiServiceInstance = new VertexAIProvider(project, location, modelName);
  }

  return aiServiceInstance;
}
