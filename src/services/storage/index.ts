import path from 'path';
import { LocalStorageProvider } from './local-storage-provider';
import { RailwayStorageProvider } from './railway-storage-provider';
import { StorageProvider } from './types';

/**
 * Factory function to create a storage provider based on configuration
 */
export function createStorageProvider(): StorageProvider {
  // Check if we're running on Railway
  if (process.env.RAILWAY_ENVIRONMENT) {
    // Railway volume is mounted at /uploads
    const baseDir = '/uploads';
    // Base URL for accessing files through API
    const baseUrl = '/api/uploads';
    
    return new RailwayStorageProvider(baseDir, baseUrl);
  }
  
  // For development, use local file system
  const baseDir = path.join(process.cwd(), 'public', 'uploads');
  const baseUrl = '/uploads';
  
  return new LocalStorageProvider(baseDir, baseUrl);
}

// Create a singleton instance
export const storageProvider = createStorageProvider();

// Re-export types
export * from './types';
