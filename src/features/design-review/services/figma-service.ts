/**
 * Figma API Service
 * 
 * This service handles all interactions with the Figma API, including:
 * - Extracting designs from Figma files
 * - Fetching frame images
 * - Adding and managing comments
 */

import { FrameMetadata, FramePosition, FigmaMetadata, CommentPlacement } from '../types';

/**
 * Figma API Service
 */
export class FigmaService {
  private figmaToken: string;
  
  /**
   * Create a new FigmaService
   * @param figmaToken Figma API token
   */
  constructor(figmaToken: string) {
    this.figmaToken = figmaToken;
  }
  
  /**
   * Extract file key from Figma URL
   * @param figmaUrl Figma URL
   * @returns File key
   */
  extractFileKey(figmaUrl: string): string {
    // Extract file key from URL
    // Format: https://www.figma.com/file/{fileKey}/...
    const match = figmaUrl.match(/file\/([^/]+)/);
    if (!match) {
      throw new Error('Invalid Figma URL');
    }
    return match[1];
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
      // Extract file key from URL
      const fileKey = this.extractFileKey(figmaUrl);
      
      // Get file metadata
      const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
        headers: {
          'X-Figma-Token': this.figmaToken
        }
      });
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch Figma file: ${fileResponse.statusText}`);
      }
      
      const fileData = await fileResponse.json();
      
      // Extract top-level frames
      const document = fileData.document;
      const frames = this.extractFrames(document);
      
      if (frames.length === 0) {
        throw new Error('No frames found in Figma file');
      }
      
      // Get frame IDs
      const frameIds = frames.map(frame => frame.id);
      
      // Get image URLs for frames
      const imagesResponse = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${frameIds.join(',')}&format=png`, {
        headers: {
          'X-Figma-Token': this.figmaToken
        }
      });
      
      if (!imagesResponse.ok) {
        throw new Error(`Failed to fetch frame images: ${imagesResponse.statusText}`);
      }
      
      const imagesData = await imagesResponse.json();
      
      // Map image URLs to frames
      const frameMetadata: FrameMetadata[] = [];
      const imageUrls: string[] = [];
      
      for (const frame of frames) {
        const imageUrl = imagesData.images[frame.id];
        if (imageUrl) {
          frameMetadata.push({
            id: frame.id,
            name: frame.name,
            position: frame.position,
            url: imageUrl
          });
          imageUrls.push(imageUrl);
        }
      }
      
      // Create metadata
      const metadata: FigmaMetadata = {
        fileKey,
        fileName: fileData.name,
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
   * Extract frames from a Figma document
   * @param document Figma document
   * @returns Array of frames with position information
   */
  private extractFrames(document: any): Array<{ id: string; name: string; position: FramePosition }> {
    const frames: Array<{ id: string; name: string; position: FramePosition }> = [];
    
    // Process canvas/pages
    if (document.children) {
      for (const page of document.children) {
        if (page.type === 'CANVAS' && page.children) {
          // Process frames on this page
          for (const node of page.children) {
            // Only include FRAME and COMPONENT types as top-level frames
            if ((node.type === 'FRAME' || node.type === 'COMPONENT') && node.id) {
              frames.push({
                id: node.id,
                name: node.name,
                position: {
                  x: node.absoluteBoundingBox.x,
                  y: node.absoluteBoundingBox.y,
                  width: node.absoluteBoundingBox.width,
                  height: node.absoluteBoundingBox.height
                }
              });
            }
          }
        }
      }
    }
    
    return frames;
  }
  
  /**
   * Add a comment to a Figma file
   * @param fileKey Figma file key
   * @param frameId Frame ID
   * @param message Comment message
   * @param coordinates Relative coordinates (0-1)
   * @param framePosition Frame position
   */
  async addFigmaComment(
    fileKey: string,
    frameId: string,
    message: string,
    coordinates: { x: number; y: number },
    framePosition: FramePosition
  ): Promise<string> {
    try {
      // Convert relative coordinates to absolute
      const absoluteX = framePosition.x + (coordinates.x * framePosition.width);
      const absoluteY = framePosition.y + (coordinates.y * framePosition.height);
      
      // Add comment
      const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
        method: 'POST',
        headers: {
          'X-Figma-Token': this.figmaToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          client_meta: {
            node_id: frameId,
            node_offset: {
              x: absoluteX,
              y: absoluteY
            }
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error adding Figma comment:', error);
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
      const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
        headers: {
          'X-Figma-Token': this.figmaToken
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.comments || [];
    } catch (error) {
      console.error('Error fetching Figma comments:', error);
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
      const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/comments`, {
        method: 'POST',
        headers: {
          'X-Figma-Token': this.figmaToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          comment_id: commentId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add thread comment: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.id;
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
