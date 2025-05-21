/**
 * One-time script to encrypt plaintext tokens in Account and User models
 *
 * Usage:
 * DATABASE_URL="postgresql://eliyahu@localhost:5432/neatpeek_local" npx ts-node scripts/encrypt-tokens.ts
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Constants from src/services/crypto/index.ts
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;

  if (!envKey) {
    throw new Error("ENCRYPTION_KEY environment variable not set");
  }

  // Use a crypto-safe hash of the key to ensure it's always 32 bytes (256 bits)
  return crypto.createHash("sha256").update(envKey).digest();
}

/**
 * Encrypt sensitive data
 */
function encrypt(text: string): string {
  if (!text) return text;

  try {
    const key = getEncryptionKey();

    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the data
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    // Get the authentication tag (for GCM mode)
    const authTag = cipher.getAuthTag();

    // Return all pieces needed for decryption
    return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Check if a string is already encrypted
 */
function isEncrypted(text: string): boolean {
  if (!text) return false;

  // Check if the text matches our encryption format (iv:authTag:encryptedData)
  const parts = text.split(":");
  if (parts.length !== 3) return false;

  try {
    // Try to decode the IV and auth tag as base64
    Buffer.from(parts[0], "base64");
    Buffer.from(parts[1], "base64");
    return true;
  } catch {
    return false;
  }
}

async function encryptTokens() {
  console.log("Starting token encryption...");

  // 1. Process Account model tokens
  console.log("Processing Account model tokens...");
  const accounts = await prisma.account.findMany({
    where: {
      OR: [{ access_token: { not: null } }, { refresh_token: { not: null } }],
    },
  });

  let accountsUpdated = 0;

  for (const account of accounts) {
    let needsUpdate = false;
    const updates: any = {};

    if (account.access_token && !isEncrypted(account.access_token)) {
      updates.access_token = encrypt(account.access_token);
      needsUpdate = true;
    }

    if (account.refresh_token && !isEncrypted(account.refresh_token)) {
      updates.refresh_token = encrypt(account.refresh_token);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.account.update({
        where: { id: account.id },
        data: updates,
      });
      accountsUpdated++;
    }
  }

  console.log(`Updated ${accountsUpdated} of ${accounts.length} Account records`);

  // 2. Process User model tokens
  console.log("Processing User model tokens...");
  const users = await prisma.user.findMany({
    where: {
      OR: [{ figmaAccessToken: { not: null } }, { figmaRefreshToken: { not: null } }],
    },
  });

  let usersUpdated = 0;

  for (const user of users) {
    let needsUpdate = false;
    const updates: any = {};

    if (user.figmaAccessToken && !isEncrypted(user.figmaAccessToken)) {
      updates.figmaAccessToken = encrypt(user.figmaAccessToken);
      needsUpdate = true;
    }

    if (user.figmaRefreshToken && !isEncrypted(user.figmaRefreshToken)) {
      updates.figmaRefreshToken = encrypt(user.figmaRefreshToken);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });
      usersUpdated++;
    }
  }

  console.log(`Updated ${usersUpdated} of ${users.length} User records`);

  console.log("Token encryption complete! Please delete this script after use.");
}

// Run the migration
encryptTokens()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error("Error encrypting tokens:", e);
    prisma.$disconnect();
    process.exit(1);
  });
