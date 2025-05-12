import { Logger } from "./logger";

// Create a logger instance for API use
export const apiLogger = new Logger({
  service: "api",
});

// Helper function to log API errors
export const logApiError = (error: Error, route: string, method: string): void => {
  apiLogger.logApiError(error, route, method);
};

// Helper function to log API requests
export const logApiRequest = (
  method: string,
  path: string,
  metadata?: Record<string, unknown>
): void => {
  apiLogger.logRequest(method, path, metadata);
};

// Helper function to log API responses
export const logApiResponse = (
  method: string,
  path: string,
  status: number,
  metadata?: Record<string, unknown>
): void => {
  apiLogger.logResponse(method, path, status, metadata);
};
