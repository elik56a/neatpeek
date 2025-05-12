import path from "path";
import { LocalStorageProvider } from "./local-storage-provider";
import { RailwayStorageProvider } from "./railway-storage-provider";
import { ClientStorageProvider } from "./client-storage-provider";
import { StorageProvider } from "./types";

// Server-side storage provider
let serverStorageProvider: StorageProvider | null = null;

export function getServerStorageProvider(): StorageProvider {
  if (!serverStorageProvider) {
    // Check if we're running on Railway
    if (process.env.RAILWAY_ENVIRONMENT) {
      // Railway volume is mounted at /uploads
      const baseDir = "/uploads";
      // Base URL for accessing files through API
      const baseUrl = "/api/uploads";
      serverStorageProvider = new RailwayStorageProvider(baseDir, baseUrl);
    } else {
      // For development, use local file system
      const baseDir = path.join(process.cwd(), "public", "uploads");
      const baseUrl = "/uploads";
      serverStorageProvider = new LocalStorageProvider(baseDir, baseUrl);
    }
  }
  return serverStorageProvider;
}

// Client-side storage provider
let clientStorageProvider: StorageProvider | null = null;

export function getClientStorageProvider(): StorageProvider {
  if (!clientStorageProvider) {
    clientStorageProvider = new ClientStorageProvider();
  }
  return clientStorageProvider;
}

// Export the appropriate provider based on environment
export const storageProvider = typeof window === "undefined"
  ? getServerStorageProvider()
  : getClientStorageProvider();

// Re-export types
export * from "./types";
