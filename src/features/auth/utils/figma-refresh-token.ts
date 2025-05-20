import "server-only";
import { prisma } from "@/services/db/prisma";
import { TokenService } from "@/services/tokens";
import { decrypt, encrypt, isEncrypted } from "@/services/crypto";
import { JWT } from "next-auth/jwt";

// Token expiration constants
export const TOKEN_REFRESH_CONSTANTS = {
  // Default token validity (90 days in seconds)
  DEFAULT_EXPIRY_SEC: 90 * 24 * 60 * 60, // 90 days
  // Time before expiry when we should refresh (5 minutes in milliseconds)
  REFRESH_WINDOW_MS: 5 * 60 * 1000,
};

/**
 * Refreshes a Figma access token using the refresh token
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
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: actualRefreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to refresh token" }));
      throw new Error(error.message || "Failed to refresh Figma token");
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
 *
 * @param token The NextAuth JWT token
 * @returns Updated token with refreshed Figma tokens if needed
 */
export async function ensureFreshFigmaToken(token: JWT): Promise<JWT> {
  // Only proceed if we have all necessary Figma tokens
  if (!token.figmaAccessToken || !token.figmaRefreshToken || !token.figmaTokenExpiry) {
    return token;
  }

  // Convert expiry to Date if it's a string
  const expiryDate =
    typeof token.figmaTokenExpiry === "string"
      ? new Date(token.figmaTokenExpiry)
      : token.figmaTokenExpiry instanceof Date
        ? token.figmaTokenExpiry
        : null;

  // Check if token is expired or about to expire soon
  if (
    expiryDate &&
    expiryDate instanceof Date &&
    expiryDate.getTime() < Date.now() + TOKEN_REFRESH_CONSTANTS.REFRESH_WINDOW_MS
  ) {
    try {
      console.log("Refreshing Figma token...");

      // Get the refresh token (which may be encrypted)
      const refreshToken = token.figmaRefreshToken as string;

      // Refresh the token
      const refreshedTokens = await refreshFigmaToken(refreshToken);

      // Set new expiry - either from response or default expiry time
      const expiresAt = refreshedTokens.expires_in
        ? Date.now() + refreshedTokens.expires_in * 1000
        : Date.now() + TOKEN_REFRESH_CONSTANTS.DEFAULT_EXPIRY_SEC * 1000;

      const expiryDate = new Date(expiresAt);

      // Update JWT with new tokens (unencrypted for the session)
      token.figmaAccessToken = refreshedTokens.access_token;
      token.figmaRefreshToken = refreshedTokens.refresh_token || token.figmaRefreshToken;
      token.figmaTokenExpiry = expiryDate;

      // Store encrypted tokens in the database if we have a user ID
      if (token.id) {
        // Use the token service to store encrypted tokens
        await TokenService.storeFigmaTokens(
          token.id as string,
          refreshedTokens.access_token,
          refreshedTokens.refresh_token ||
            (isEncrypted(refreshToken) ? decrypt(refreshToken) : refreshToken),
          expiryDate
        );

        console.log("Updated user with refreshed Figma tokens");
      }
    } catch (error) {
      console.error("Failed to refresh Figma token:", error);
      // Don't throw - just continue with expired token
    }
  }

  return token;
}
