import "server-only";
import crypto from "crypto";

// Constants
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Get encryption key from environment
 * In production, this should be a strong, randomly generated key stored securely
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
 * @param text Plain text to encrypt
 * @returns Encrypted data format: iv:authTag:encryptedData (base64)
 */
export function encrypt(text: string): string {
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
 * Decrypt sensitive data
 * @param encryptedText Encrypted text in format: iv:authTag:encryptedData (base64)
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;

  try {
    // Split the encrypted text into its components
    const [ivBase64, authTagBase64, encryptedData] = encryptedText.split(":");

    if (!ivBase64 || !authTagBase64 || !encryptedData) {
      console.error("Invalid encrypted data format:", {
        ivBase64,
        authTagBase64,
        encryptedData,
        encryptedText,
      });
      throw new Error("Invalid encrypted data format");
    }

    const key = getEncryptionKey();
    const iv = Buffer.from(ivBase64, "base64");
    const authTag = Buffer.from(authTagBase64, "base64");

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encryptedData, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Check if a string is already encrypted
 * @param text Text to check
 * @returns Whether the text appears to be encrypted
 */
export function isEncrypted(text: string): boolean {
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
