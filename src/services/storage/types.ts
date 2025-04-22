/**
 * Interface for file storage providers
 * This allows us to easily swap out storage providers in the future
 */
export interface StorageProvider {
  /**
   * Save a file to storage
   */
  saveFile(params: SaveFileParams): Promise<SaveFileResult>;

  /**
   * Get a file URL from storage
   */
  getFileUrl(path: string): string;

  /**
   * Get a file buffer from storage
   */
  getFile(path: string): Promise<Buffer>;

  /**
   * Delete a file from storage
   */
  deleteFile(path: string): Promise<void>;
}

export interface SaveFileParams {
  /**
   * File buffer
   */
  buffer: Buffer;

  /**
   * Original filename
   */
  filename: string;

  /**
   * MIME type of the file
   */
  mimeType: string;

  /**
   * Folder path to save the file in
   */
  folder: string;
}

export interface SaveFileResult {
  /**
   * Public URL to access the file
   */
  url: string;

  /**
   * Path to the file in storage
   */
  path: string;
}
