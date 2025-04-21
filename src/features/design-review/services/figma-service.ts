/**
 * Figma API Service
 *
 * This service handles all interactions with the Figma API, including:
 * - Extracting designs from Figma files
 * - Fetching frame images
 * - Adding and managing comments
 */

import { FigmaInfo, FigmaMetadata, FrameImageData, FrameInfo, FrameMetadata, FramePosition } from '../types';

// Constants
const FIGMA_API_BASE_URL = 'https://api.figma.com';
const FIGMA_API_VERSION = 'v1';

/**
 * Figma API Service
 */
export class FigmaService {
  private figmaToken: string;
  private baseUrl: string;

  /**
   * Create a new FigmaService
   * @param figmaToken Figma API token
   */
  constructor(figmaToken: string) {
    this.figmaToken = figmaToken;
    this.baseUrl = `${FIGMA_API_BASE_URL}/${FIGMA_API_VERSION}`;
  }

  /**
   * Make a request to the Figma API
   * @param endpoint API endpoint
   * @param options Request options
   * @returns Response data
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.figmaToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Error in Figma API request to ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Extract file key and node ID from Figma URL
   * @param url Figma URL
   * @returns FigmaInfo object with fileKey and nodeId
   */
  extractFigmaInfo(url: string): FigmaInfo {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileKey = pathParts[2];
      const nodeIdMatch = urlObj.search.match(/node-id=([^&]+)/);

      // Convert node ID format from URL (e.g., "6-60") to API format (e.g., "6:60")
      const nodeId = nodeIdMatch ? nodeIdMatch[1].replace('-', ':') : null;

      return { fileKey, nodeId };
    } catch (error) {
      console.error('Failed to parse Figma URL:', error);
      return { fileKey: null, nodeId: null };
    }
  }

  /**
   * Extract file key from Figma URL (legacy method)
   * @param figmaUrl Figma URL
   * @returns File key
   */
  extractFileKey(figmaUrl: string): string {
    const info = this.extractFigmaInfo(figmaUrl);
    if (!info.fileKey) {
      throw new Error('Invalid Figma URL');
    }
    return info.fileKey;
  }

  /**
   * Get file information
   * @param fileKey Figma file key
   * @returns File information
   */
  async getFileInfo(fileKey: string): Promise<any> {
    return this.request<any>(`/files/${fileKey}`);
  }

  /**
   * Get node information
   * @param fileKey Figma file key
   * @param nodeId Node ID
   * @returns Node information
   */
  async getNodeInfo(fileKey: string, nodeId: string): Promise<any> {
    const formattedNodeId = nodeId.includes(':') ? nodeId : nodeId.replace('-', ':');
    return this.request<any>(`/files/${fileKey}/nodes?ids=${formattedNodeId}`);
  }

  /**
   * Get image URLs for nodes
   * @param fileKey Figma file key
   * @param nodeIds Array of node IDs
   * @param format Image format
   * @returns Object mapping node IDs to image URLs
   */
  async getImageUrls(fileKey: string, nodeIds: string[], format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png'): Promise<any> {
    return this.request<any>(`/images/${fileKey}?ids=${nodeIds.join(',')}&format=${format}`);
  }

  /**
   * Get child frames from a Figma file and node
   * @param fileKey Figma file key
   * @param nodeId Node ID
   * @returns Array of frame information
   */
  async getChildFrames(fileKey: string, nodeId: string): Promise<FrameInfo[]> {
    try {
      const data = await this.getNodeInfo(fileKey, nodeId);
      const frames: FrameInfo[] = [];
      const formattedNodeId = nodeId.includes(':') ? nodeId : nodeId.replace('-', ':');

      function processNode(node: any) {
        // Only process top-level frames (direct children of the parent node)
        if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
          if (node.absoluteBoundingBox) {
            frames.push({
              id: node.id,
              name: node.name,
              type: node.type,
              absoluteBoundingBox: {
                x: node.absoluteBoundingBox.x,
                y: node.absoluteBoundingBox.y,
                width: node.absoluteBoundingBox.width,
                height: node.absoluteBoundingBox.height
              }
            });
          }
        }

        // Only process children if the current node is the document or canvas
        // This ensures we only get top-level frames
        if (node.type === 'DOCUMENT' || node.type === 'CANVAS') {
          node.children?.forEach(processNode);
        }
      }

      const nodes = data.nodes[formattedNodeId];
      if (nodes && nodes.document) {
        processNode(nodes.document);
      }

      console.log('Found top-level frames:', frames.length);
      return frames;
    } catch (error) {
      console.error('Error retrieving frames:', error);
      throw error;
    }
  }

  /**
   * Get frame images from a Figma file
   * @param fileKey Figma file key
   * @param frames Array of frame information
   * @returns Record of frame name to image data
   */
  async getFrameImages(fileKey: string, frames: FrameInfo[]): Promise<Record<string, FrameImageData>> {
    try {
      const nodeIds = frames.map(frame => frame.id);
      const data = await this.getImageUrls(fileKey, nodeIds);
      const imageUrls = data.images;
      const frameImages: Record<string, FrameImageData> = {};

      frames.forEach(frame => {
        if (imageUrls[frame.id]) {
          frameImages[frame.name] = {
            id: frame.id,
            url: imageUrls[frame.id],
            type: frame.type,
            position: frame.absoluteBoundingBox
          };
        }
      });

      return frameImages;
    } catch (error) {
      console.error('Error retrieving image URLs:', error);
      throw error;
    }
  }

  /**
   * Extract designs from a Figma file
   * @param figmaUrl Figma URL
   * @returns Image URLs and metadata
   */
  async extractDesignsFromFigma(figmaUrl: string): Promise<{
    imageUrls: string[];
    metadata: FigmaMetadata;
  }> {
    try {
      // Extract file key and node ID from URL
      const { fileKey, nodeId } = this.extractFigmaInfo(figmaUrl);

      if (!fileKey) {
        throw new Error('Invalid Figma URL');
      }

      // Get the starting node ID (either the one from the URL or the root)
      const startNodeId = nodeId || '0:1';

      // Get child frames directly without fetching the entire file
      const frames = await this.getChildFrames(fileKey, startNodeId);

      if (frames.length === 0) {
        throw new Error('No frames found in Figma file');
      }

      // Get frame images
      const frameImages = await this.getFrameImages(fileKey, frames);

      // Map image URLs to frames
      const frameMetadata: FrameMetadata[] = [];
      const imageUrls: string[] = [];

      for (const frame of frames) {
        const imageData = frameImages[frame.name];
        if (imageData && imageData.url) {
          frameMetadata.push({
            id: frame.id,
            name: frame.name,
            position: frame.absoluteBoundingBox,
            url: imageData.url
          });
          imageUrls.push(imageData.url);
        }
      }

      // Get file name from Figma API
      const fileInfo = await this.getFileInfo(fileKey);

      // Create metadata
      const metadata: FigmaMetadata = {
        fileKey,
        fileName: fileInfo.name,
        extractionDate: new Date().toISOString(),
        frames: frameMetadata
      };

      return {
        imageUrls,
        metadata
      };
    } catch (error) {
      console.error('Error extracting designs from Figma:', error);
      throw error;
    }
  }

  /**
   * Get all comments from a Figma file
   * @param fileKey Figma file key
   * @returns Array of comments
   */
  async getFigmaComments(fileKey: string): Promise<any[]> {
    try {
      const response = await this.request<any>(`/files/${fileKey}/comments`);
      return response.comments || [];
    } catch (error) {
      console.error('Error fetching Figma comments:', error);
      throw error;
    }
  }

  /**
   * Add a comment to a Figma file
   * @param fileKey Figma file key
   * @param frameId Frame ID
   * @param message Comment message
   * @param coordinates Relative coordinates
   * @param framePosition Frame position
   * @returns Comment ID
   */
  async addFigmaComment(
    fileKey: string,
    frameId: string,
    message: string,
    coordinates: { x: number; y: number },
    framePosition: FramePosition
  ): Promise<string> {
    try {

      const requestBody = {
        message,
        client_meta: {
          node_id: frameId,
          node_offset: {
            x: coordinates.x * framePosition.width,
            y: coordinates.y * framePosition.height
          }
        }
      };

      const response = await this.request<any>(`/files/${fileKey}/comments`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      return response.id;
    } catch (error) {
      console.error('Error adding Figma comment:', error);
      throw error;
    }
  }

  /**
   * Add a thread comment to an existing comment
   * @param fileKey Figma file key
   * @param commentId Parent comment ID
   * @param message Comment message
   * @returns Comment ID
   */
  async addThreadComment(
    fileKey: string,
    commentId: string,
    message: string
  ): Promise<string> {
    try {
      const requestBody = {
        message,
        comment_id: commentId
      };

      const response = await this.request<any>(`/files/${fileKey}/comments`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      return response.id;
    } catch (error) {
      console.error('Error adding thread comment:', error);
      throw error;
    }
  }

  /**
   * Convert a URL to inline data for AI processing
   * @param url Image URL
   * @returns Part object for AI request
   */
  async urlToInlineData(url: string): Promise<any> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/png';

      return {
        inlineData: {
          data: base64,
          mimeType
        }
      };
    } catch (error) {
      console.error('Error converting URL to inline data:', error);
      throw error;
    }
  }
}
