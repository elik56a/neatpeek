import fs from 'fs';
import path from 'path';
import { SaveFileParams, SaveFileResult, StorageProvider } from './types';

/**
 * Implementation of StorageProvider using local file system
 * This is for development purposes only
 */
export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;
  private baseUrl: string;

  constructor(baseDir: string, baseUrl: string) {
    this.baseDir = baseDir;
    this.baseUrl = baseUrl;

    // Ensure the base directory exists
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
  }

  /**
   * Save a file to local storage
   */
  async saveFile(params: SaveFileParams): Promise<SaveFileResult> {
    // Create folder if it doesn't exist
    const folderPath = path.join(this.baseDir, params.folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${params.filename}`;
    const filePath = path.join(folderPath, uniqueFilename);

    // Save the file
    await fs.promises.writeFile(filePath, params.buffer);

    // Generate the URL and path
    const relativePath = path.join(params.folder, uniqueFilename);
    const url = `${this.baseUrl}/${relativePath.replace(/\\/g, '/')}`;

    return {
      url,
      path: relativePath,
    };
  }

  /**
   * Get a file URL from local storage
   */
  getFileUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/\\/g, '/')}`;
  }

  /**
   * Get a file buffer from local storage
   */
  async getFile(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return fs.promises.readFile(fullPath);
  }

  /**
   * Delete a file from local storage
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}
