import "server-only";
import { decrypt, isEncrypted } from "@/services/crypto";
import { FigmaAuthError } from "@/features/design-review/services/figma-service";

/**
 * FIGMA TOKEN LIFECYCLE - SIMPLIFIED
 *
 * Important notes about Figma's OAuth implementation:
 *
 * 1. Access tokens expire after 90 DAYS
 * 2. Refresh tokens can be reused multiple times
 * 3. We don't need complex refresh logic - just store tokens and use them
 * 4. If token is invalid, redirect user to OAuth (handled by FigmaAuthError)
 *
 * Reference: https://www.figma.com/developers/api#oauth2
 */

/**
 * Check if a Figma token is about to expire within the next hour
 * @param tokenExpiry The token expiry date
 * @returns true if token expires within the next hour
 */
export function isTokenExpiringWithinHour(tokenExpiry: Date): boolean {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour in milliseconds

  return tokenExpiry <= oneHourFromNow;
}

/**
 * Refreshes a Figma access token using the refresh token
 * Only called when we get an invalid token error from Figma or when token is about to expire
 */
export async function refreshFigmaToken(refreshToken: string) {
  if (!refreshToken) {
    throw new Error("No refresh token provided");
  }

  // Decrypt the token if it's encrypted
  const actualRefreshToken = isEncrypted(refreshToken) ? decrypt(refreshToken) : refreshToken;

  const clientId = process.env.FIGMA_CLIENT_ID!;
  const clientSecret = process.env.FIGMA_CLIENT_SECRET!;
  const redirectUri = process.env.NEXTAUTH_URL + "/api/auth/callback/figma";

  try {
    // Prepare form data as per Figma docs - include all required parameters like in the provider
    const formData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: actualRefreshToken,
      grant_type: "refresh_token",
      redirect_uri: redirectUri,
    });

    console.log("Refreshing Figma token...");

    const response = await fetch("https://api.figma.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Add basic auth header as per Figma docs
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const responseText = await response.text();
      let errorMessage = "Failed to refresh token";

      try {
        const errorData = JSON.parse(responseText);
        errorMessage =
          errorData.error_description || errorData.message || errorData.error || errorMessage;

        console.error("Figma token refresh error:", {
          status: response.status,
          error: errorData,
        });

        // Handle specific error types
        if (errorData.error === "invalid_grant") {
          throw new FigmaAuthError(
            "Refresh token is invalid. User needs to reconnect their Figma account."
          );
        }
      } catch (e) {
        console.error("Failed to parse error response:", responseText);
      }

      throw new Error(errorMessage);
    }

    const refreshResult = await response.json();
    console.log("Figma token refresh successful");

    return refreshResult;
  } catch (error) {
    console.error("Error refreshing Figma token:", error);
    throw error;
  }
}
