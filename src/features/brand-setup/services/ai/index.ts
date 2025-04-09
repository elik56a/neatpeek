import { AIProvider } from "./types";
import { VertexAIProvider } from "./vertex-ai-provider";

/**
 * Factory function to create an AI provider based on configuration
 */
export function createAIProvider(): AIProvider {
  // Get the project ID from environment variables
  const project = process.env.GOOGLE_PROJECT_ID || '';
  const location = process.env.GOOGLE_LOCATION || 'us-central1';
  const modelName = process.env.GOOGLE_MODEL_NAME || 'gemini-2.5-pro-exp-03-25';

  // In the future, we could add more providers and select based on configuration
  return new VertexAIProvider(project, location, modelName);
}

// Re-export types
export * from "./types";
