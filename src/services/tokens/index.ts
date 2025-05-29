import "server-only";
import { encrypt, decrypt } from "../crypto";
import { prisma } from "../db/prisma";
import { FigmaTokens } from "@/types/general";
import {
  isTokenExpiringWithinHour,
  refreshFigmaToken,
} from "@/features/auth/server/figma-auth-util";

/**
 * Token service for handling secure storage and retrieval of sensitive tokens
 */
export class TokenService {
  /**
   * Store a Figma access token securely in the database
   *
   * @param userId The user ID
   * @param accessToken The Figma access token to store
   * @param refreshToken The Figma refresh token to store
   * @param tokenExpiry The token expiry date
   */
  static async storeFigmaTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    tokenExpiry: Date
  ): Promise<void> {
    try {
      // Encrypt tokens before storage
      const encryptedAccessToken = encrypt(accessToken);
      const encryptedRefreshToken = encrypt(refreshToken);

      // Update the user record with encrypted tokens
      await prisma.user.update({
        where: { id: userId },
        data: {
          figmaAccessToken: encryptedAccessToken,
          figmaRefreshToken: encryptedRefreshToken,
          figmaTokenExpiry: tokenExpiry,
        },
      });
    } catch (error) {
      console.error("Error storing Figma tokens:", error);
      throw new Error("Failed to store Figma tokens securely");
    }
  }

  /**
   * Get a user's Figma access token
   *
   * @param userId The user ID
   * @returns The decrypted access token, or null if not found
   */
  static async getFigmaAccessToken(userId: string): Promise<string | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { figmaAccessToken: true },
      });

      if (!user?.figmaAccessToken) {
        return null;
      }

      // Decrypt the token
      return decrypt(user.figmaAccessToken);
    } catch (error) {
      console.error("Error retrieving Figma access token:", error);
      throw new Error("Failed to retrieve Figma access token");
    }
  }

  /**
   * Get a user's Figma refresh token
   *
   * @param userId The user ID
   * @returns The decrypted refresh token, or null if not found
   */
  static async getFigmaRefreshToken(userId: string): Promise<string | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { figmaRefreshToken: true },
      });

      if (!user?.figmaRefreshToken) {
        return null;
      }

      // Decrypt the token
      return decrypt(user.figmaRefreshToken);
    } catch (error) {
      console.error("Error retrieving Figma refresh token:", error);
      throw new Error("Failed to retrieve Figma refresh token");
    }
  }

  /**
   * Get a user's Figma tokens
   *
   * @param userId The user ID
   * @param tokenExpiry The token expiry date
   * @returns The decrypted access token, refresh token, and token expiry
   */
  static async getFigmaTokens(userId: string, tokenExpiry: Date): Promise<FigmaTokens> {
    // Check if token is about to expire within the next hour
    if (isTokenExpiringWithinHour(tokenExpiry)) {
      console.log("Figma token is about to expire, attempting to refresh...");

      try {
        // Get the current refresh token
        const refreshToken = await this.getFigmaRefreshToken(userId);

        if (!refreshToken) {
          throw new Error("No refresh token available for token refresh");
        }

        // Refresh the token
        const refreshResult = await refreshFigmaToken(refreshToken);

        if (refreshResult.access_token && refreshResult.refresh_token) {
          // Calculate new expiry date using the expires_in value from Figma's response
          const newExpiry = new Date();
          if (refreshResult.expires_in) {
            // expires_in is in seconds, so convert to milliseconds
            newExpiry.setTime(newExpiry.getTime() + refreshResult.expires_in * 1000);
          } else {
            // Fallback to 90 days if expires_in is not provided (shouldn't happen with Figma)
            newExpiry.setDate(newExpiry.getDate() + 90);
          }

          // Store the new tokens
          await this.storeFigmaTokens(
            userId,
            refreshResult.access_token,
            refreshResult.refresh_token,
            newExpiry
          );

          console.log("Figma token refreshed successfully");

          // Return the new tokens
          return {
            accessToken: refreshResult.access_token,
            refreshToken: refreshResult.refresh_token,
            tokenExpiry: newExpiry,
            id: userId,
          };
        }
      } catch (error) {
        console.error("Failed to refresh Figma token:", error);
        // Fall through to return existing tokens - let the API handle the auth error
      }
    }

    // Return existing tokens (either not expiring soon or refresh failed)
    const [accessToken, refreshToken] = await Promise.all([
      this.getFigmaAccessToken(userId),
      this.getFigmaRefreshToken(userId),
    ]);

    return { accessToken, refreshToken, tokenExpiry, id: userId };
  }
}
