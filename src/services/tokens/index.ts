import "server-only";
import { encrypt, decrypt } from "../crypto";
import { prisma } from "../db/prisma";

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
}
