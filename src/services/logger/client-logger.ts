import { Logger } from "./logger";

// Create a logger instance for client-side use
export const clientLogger = new Logger({
  service: "client",
});

// Helper function to log client-side errors
export const logClientError = (error: Error, context?: string): void => {
  clientLogger.logError(error, context);
};

// Helper function to log client-side API calls
export const logClientApiCall = (
  method: string,
  url: string,
  status: number,
  metadata?: Record<string, unknown>
): void => {
  clientLogger.logResponse(method, url, status, metadata);
};
