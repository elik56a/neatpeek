import "server-only";
import { TokenService } from "@/services/tokens";
import { decrypt, isEncrypted } from "@/services/crypto";
import { FigmaTokens } from "@/types/general";

/**
 * FIGMA TOKEN LIFECYCLE
 *
 * Important notes about Figma's OAuth implementation:
 *
 * 1. Access tokens expire after 24 hours (86400 seconds)
 * 2. Refresh tokens may have limited uses or lifetimes
 * 3. Figma will return 'invalid_grant' if:
 *    - The refresh token is expired
 *    - The refresh token has already been used (one-time use)
 *    - The client ID/secret are incorrect
 *
 * When this happens, the user must reconnect their Figma account to get fresh tokens.
 *
 * Reference: https://www.figma.com/developers/api#oauth2
 */

// Token expiration constants
export const TOKEN_REFRESH_CONSTANTS = {
  // Figma tokens expire after 24 hours (86400 seconds)
  DEFAULT_EXPIRY_SEC: 24 * 60 * 60, // 24 hours
  // Refresh window - refresh if token expires in the next 20 minutes
  REFRESH_WINDOW_MS: 20 * 60 * 1000,
};

/**
 * Refreshes a Figma access token using the refresh token
 * @returns Object with new access_token, refresh_token, and expires_in
 */
export async function refreshFigmaToken(refreshToken: string) {
  if (!refreshToken) {
    throw new Error("No refresh token provided");
  }

  // Decrypt the token if it's encrypted
  const actualRefreshToken = isEncrypted(refreshToken) ? decrypt(refreshToken) : refreshToken;

  const clientId = process.env.FIGMA_CLIENT_ID!;
  const clientSecret = process.env.FIGMA_CLIENT_SECRET!;

  try {
    const response = await fetch("https://api.figma.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add basic auth header for proper authentication
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: actualRefreshToken,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      let errorMessage = "Failed to refresh token";

      try {
        const errorData = JSON.parse(responseText);
        errorMessage =
          errorData.error_description || errorData.message || errorData.error || errorMessage;

        // Log detailed error information
        console.error("Figma token refresh error details:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        // Handle specific error types
        if (errorData.error === "invalid_grant") {
          throw new Error(
            "invalid_grant: The refresh token is invalid or expired. User needs to reconnect their Figma account."
          );
        }
      } catch (e) {
        // Ignore JSON parsing errors
        console.error("Failed to parse error response:", responseText);
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error refreshing Figma token:", error);
    throw error;
  }
}

/**
 * Checks if a Figma token is expired or about to expire and refreshes it if needed
 * Updates both the JWT token and the database
 */
export async function ensureFreshFigmaToken(figmaTokens: FigmaTokens): Promise<FigmaTokens> {
  // Only proceed if we have all necessary Figma tokens
  if (!figmaTokens.accessToken || !figmaTokens.refreshToken || !figmaTokens.tokenExpiry) {
    return figmaTokens;
  }

  // Convert expiry to Date if it's a string
  const expiryDate =
    typeof figmaTokens.tokenExpiry === "string"
      ? new Date(figmaTokens.tokenExpiry)
      : figmaTokens.tokenExpiry;

  // Check if token is expired or about to expire soon (next 20 minutes)
  const shouldRefresh =
    expiryDate instanceof Date &&
    expiryDate.getTime() < Date.now() + TOKEN_REFRESH_CONSTANTS.REFRESH_WINDOW_MS;

  if (shouldRefresh) {
    try {
      console.log("Refreshing Figma token (expires soon)");

      // Refresh the token
      const refreshedTokens = await refreshFigmaToken(figmaTokens.refreshToken as string);

      // Calculate new expiry date using Figma's expires_in value (or default 24h)
      const expiresIn = refreshedTokens.expires_in || TOKEN_REFRESH_CONSTANTS.DEFAULT_EXPIRY_SEC;
      const newExpiryDate = new Date(Date.now() + expiresIn * 1000);

      // Update JWT with new tokens for the session
      figmaTokens.accessToken = refreshedTokens.access_token;
      figmaTokens.refreshToken = refreshedTokens.refresh_token || figmaTokens.refreshToken;
      figmaTokens.tokenExpiry = newExpiryDate;

      // Store tokens in database if we have a user ID
      if (figmaTokens.id) {
        await TokenService.storeFigmaTokens(
          figmaTokens.id as string,
          refreshedTokens.access_token,
          refreshedTokens.refresh_token || figmaTokens.refreshToken,
          newExpiryDate
        );
      }
    } catch (error) {
      console.error("Failed to refresh Figma token:", error);
      // Don't throw - continue with expired token
    }
  }

  return figmaTokens;
}
