import path from 'path';
import { LocalStorageProvider } from './local-storage-provider';
import { StorageProvider } from './types';

/**
 * Factory function to create a storage provider based on configuration
 */
export function createStorageProvider(): StorageProvider {
  // In production, we would use a cloud storage provider like S3
  // For development, we use local file system
  const baseDir = path.join(process.cwd(), 'public', 'uploads');
  const baseUrl = '/uploads';
  
  return new LocalStorageProvider(baseDir, baseUrl);
}

// Re-export types
export * from './types';
