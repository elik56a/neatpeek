import { prisma } from "@/services/db/prisma";
import {
  FigmaMetadata,
  ReviewStatus,
  ReviewHistoryAction,
  HistoryChanges,
  FramePosition,
  BrandIssue,
  GeneralIssue
} from "../types";
import { AIService } from "@/services/ai";
import { FigmaService } from "./figma-service";
// We'll import the AI service dynamically to avoid client-side imports

/**
 * Core service with shared functionality for design reviews
 * This service contains common methods used by other design review services
 */
export class DesignReviewCoreService {
  private figmaService: FigmaService;
  private aiService: AIService | null = null;

  constructor(figmaToken?: string) {
    this.figmaService = new FigmaService(figmaToken);
  }

  /**
   * Initialize AI service
   */
  async initAIService(): Promise<AIService> {
    if (!this.aiService) {
      const { getAIService } = await import('@/services/ai');
      this.aiService = await getAIService();
    }
    return this.aiService;
  }

  /**
   * Get the Figma service
   */
  getFigmaService(): FigmaService {
    return this.figmaService;
  }

  /**
   * Extract designs from Figma URL
   * @param figmaUrl Figma URL
   * @returns Image URLs and metadata
   */
  async extractDesignsFromFigma(figmaUrl: string): Promise<{ imageUrls: string[]; metadata: FigmaMetadata }> {
    return this.figmaService.extractDesignsFromFigma(figmaUrl);
  }

  /**
   * Filter image URLs based on selected frame IDs
   * @param metadata Figma metadata
   * @param imageUrls All image URLs
   * @param selectedFrameIds Selected frame IDs
   * @returns Filtered image URLs
   */
  filterImageUrls(metadata: FigmaMetadata, imageUrls: string[], selectedFrameIds?: string[]): string[] {
    if (!selectedFrameIds || selectedFrameIds.length === 0) {
      return imageUrls;
    }

    // Create a mapping from frameId to imageUrl
    const frameIdToImageUrl: Record<string, string> = {};
    metadata.frames.forEach(frame => {
      if (frame.id && frame.url) {
        frameIdToImageUrl[frame.id] = frame.url;
      }
    });

    // Filter image URLs based on selected frame IDs
    const filteredImageUrls = selectedFrameIds
      .map(frameId => frameIdToImageUrl[frameId])
      .filter(Boolean) as string[];

    console.log(`Filtered ${imageUrls.length} frames down to ${filteredImageUrls.length} selected frames`);
    return filteredImageUrls;
  }

  /**
   * Process images for AI analysis
   * @param imageUrls Image URLs
   * @returns Image parts for AI
   */
  async processImagesForAI(imageUrls: string[]): Promise<string[]> {
    return Promise.all(imageUrls.map(url => this.figmaService.urlToInlineData(url)));
  }

  /**
   * Create a URL to frame data mapping
   * @param metadata Figma metadata
   * @returns Mapping from URL to frame data
   */
  createUrlToFrameDataMap(metadata: FigmaMetadata): Record<string, { id: string; position: FramePosition }> {
    return metadata.frames.reduce<Record<string, { id: string; position: FramePosition }>>((map, frame) => {
      if (frame.url && frame.id && frame.position) {
        map[frame.url] = {
          id: frame.id,
          position: frame.position
        };
      }
      return map;
    }, {});
  }

  /**
   * Create a history entry
   * @param data History entry data
   * @returns Created history entry
   */
  async createHistoryEntry(data: {
    sessionId: string;
    frameId?: string;
    action: ReviewHistoryAction;
    summary: string;
    changes?: HistoryChanges;
  }) {
    try {
      const historyEntry = await prisma.reviewHistory.create({
        data: {
          sessionId: data.sessionId,
          frameId: data.frameId,
          action: data.action,
          summary: data.summary,
          changes: data.changes as unknown as any,
          timestamp: new Date()
        }
      });

      return historyEntry;
    } catch (error) {
      console.error('Error creating history entry:', error);
      throw error;
    }
  }

  /**
   * Update session status
   * @param sessionId Session ID
   * @param status New status
   */
  async updateSessionStatus(sessionId: string, status: ReviewStatus) {
    await prisma.designReviewSession.update({
      where: { id: sessionId },
      data: { status }
    });
  }

  /**
   * Add Figma comments for issues
   * @param metadata Figma metadata
   * @param frameData Frame data
   * @param issues Issues to add comments for
   * @param formatComment Function to format comment text
   */
  async addFigmaComments(
    metadata: FigmaMetadata,
    frameData: { id: string; position: FramePosition },
    issues: (BrandIssue | GeneralIssue)[],
    formatComment: (issue: BrandIssue | GeneralIssue, isNew?: boolean) => string
  ) {
    if (!frameData || !issues) return;

    for (const issue of issues) {
      const commentText = formatComment(issue);
      const commentId = await this.figmaService.addFigmaComment(
        metadata.fileKey,
        frameData.id,
        commentText,
        issue.coordinates,
        frameData.position
      );

      // Store the comment ID directly in the issue
      issue.figma_comment_id = commentId;
    }
  }
}
