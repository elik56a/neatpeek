import { prisma } from "@/services/db/prisma";
import {
  CreateSessionInput,
  DesignReviewSession,
  DesignReviewSessionWithRelations,
  SessionAnalysisInput,
  SessionRecheckInput,
  SessionAnalysisResult,
  SessionRecheckResult,
  ReviewStatus,
  ReviewHistoryAction,
  HistoryChanges,
  ReviewJson,
  DesignReviewWithFrame
} from "../types";
import { DesignReviewCoreService } from "./design-review-core-service";
import { FrameReviewService } from "./frame-review-service";
import { DesignRecheckService } from "./design-recheck-service";

/**
 * Main service for managing design review sessions
 * This is the primary entry point for design review operations
 */
export class DesignReviewSessionService {
  private coreService: DesignReviewCoreService;
  private frameService: FrameReviewService;
  private recheckService: DesignRecheckService;

  constructor(figmaToken?: string) {
    this.coreService = new DesignReviewCoreService(figmaToken);
    this.frameService = new FrameReviewService(this.coreService);
    this.recheckService = new DesignRecheckService(this.coreService);
  }

  /**
   * Create a new design review session
   * @param input Session creation input
   * @returns Created session
   */
  async createSession(input: CreateSessionInput): Promise<DesignReviewSession> {
    try {
      const session = await prisma.designReviewSession.create({
        data: {
          userId: input.userId,
          brandGuidelineId: input.brandGuidelineId,
          figmaUrl: input.figmaUrl,
          figmaFileKey: input.figmaFileKey,
          figmaFileName: input.figmaFileName,
          status: ReviewStatus.PENDING
        }
      });

      return session;
    } catch (error) {
      console.error('Error creating design review session:', error);
      throw error;
    }
  }

  /**
   * Get a design review session by ID
   * @param id Session ID
   * @returns Session with related data
   */
  async getSessionById(id: string): Promise<DesignReviewSessionWithRelations | null> {
    try {
      const session = await prisma.designReviewSession.findUnique({
        where: { id },
        include: {
          frameReviews: {
            include: {
              frame: {
                select: {
                  id: true,
                  frameId: true,
                  name: true,
                  imageUrl: true,
                  figmaFileKey: true,
                  figmaFileName: true
                }
              }
            }
          },
          history: {
            orderBy: {
              timestamp: 'desc'
            }
          }
        }
      });

      return session;
    } catch (error) {
      console.error('Error getting design review session:', error);
      throw error;
    }
  }

  /**
   * Analyze designs for a session
   * @param input Analysis input
   * @returns Analysis result
   */
  async analyzeDesigns(input: SessionAnalysisInput): Promise<SessionAnalysisResult> {
    try {
      const { figmaUrl, brandId, userId, selectedFrameIds } = input;

      // Get brand guideline
      const brandGuideline = await prisma.brandGuideline.findUnique({
        where: { id: brandId },
        include: {
          brandRules: true
        }
      });

      if (!brandGuideline) {
        throw new Error('Brand guideline not found');
      }

      // Extract designs from Figma
      const { imageUrls, metadata } = await this.coreService.extractDesignsFromFigma(figmaUrl);

      // Filter image URLs if selectedFrameIds is provided
      const filteredImageUrls = this.coreService.filterImageUrls(metadata, imageUrls, selectedFrameIds);

      // Process images for AI
      const imageParts = await this.coreService.processImagesForAI(filteredImageUrls);

      // Initialize AI service
      const aiService = await this.coreService.initAIService();

      // Analyze designs
      const analysisResult = await aiService.analyzeDesign({
        imageParts,
        metadata,
        brandRules: brandGuideline.brandRules
      });

      // Create a new session
      const session = await this.createSession({
        userId,
        brandGuidelineId: brandId,
        figmaUrl,
        figmaFileKey: metadata.fileKey,
        figmaFileName: metadata.fileName
      });

      // Save frame reviews
      const frameReviews = await this.frameService.saveFrameReviews(
        session.id,
        metadata,
        analysisResult.reviews
      );

      // Create initial history entry
      await this.coreService.createHistoryEntry({
        sessionId: session.id,
        action: ReviewHistoryAction.INITIAL_REVIEW,
        summary: `Initial analysis of ${frameReviews.length} frames`,
        changes: <HistoryChanges>{
          brand_issues_count: frameReviews.reduce((sum, review) => {
            const reviewJson = review.reviewJson as ReviewJson;
            return sum + (reviewJson.brand_issues?.length || 0);
          }, 0),
          general_issues_count: frameReviews.reduce((sum, review) => {
            const reviewJson = review.reviewJson as ReviewJson;
            return sum + (reviewJson.general_issues?.length || 0);
          }, 0),
          total_issues_count: frameReviews.reduce((sum, review) => {
            const reviewJson = review.reviewJson as ReviewJson;
            return sum +
              (reviewJson.brand_issues?.length || 0) +
              (reviewJson.general_issues?.length || 0);
          }, 0),
          design_score: frameReviews.reduce((sum, review) => sum + review.designScore, 0) / frameReviews.length,
          fixed_count: 0,
          partially_fixed_count: 0,
          not_fixed_count: 0
        }
      });

      // Update session status
      await this.coreService.updateSessionStatus(session.id, ReviewStatus.COMPLETED);

      // Return the result
      return {
        sessionId: session.id,
        brandId,
        figmaUrl,
        fileName: metadata.fileName,
        frameReviews
      };
    } catch (error) {
      console.error('Error analyzing designs:', error);
      throw error;
    }
  }

  /**
   * Recheck designs for a session
   * @param input Recheck input
   * @returns Recheck result
   */
  async recheckDesigns(input: SessionRecheckInput): Promise<SessionRecheckResult> {
    try {
      const { sessionId, frameIds, userId } = input;

      // Get the session
      const session = await this.getSessionById(sessionId);
      if (!session) {
        throw new Error('Design review session not found');
      }

      // Get brand guideline
      const brandGuideline = await prisma.brandGuideline.findUnique({
        where: { id: session.brandGuidelineId },
        include: {
          brandRules: true
        }
      });

      if (!brandGuideline) {
        throw new Error('Brand guideline not found');
      }

      // Extract designs from Figma using the original URL
      const { imageUrls, metadata } = await this.coreService.extractDesignsFromFigma(session.figmaUrl);
      
      // Filter frames by the provided frameIds
      const selectedFrameReviews = session.frameReviews?.filter(
        review => frameIds.includes(review.frame.frameId)
      );

      if (!selectedFrameReviews || selectedFrameReviews.length === 0) {
        throw new Error('No frames found for the specified frame IDs');
      }

      // Filter image URLs based on selected frame IDs
      const filteredImageUrls = this.coreService.filterImageUrls(metadata, imageUrls, frameIds);


      if (filteredImageUrls.length === 0) {
        throw new Error('No image URLs found for the specified frame IDs');
      }

      // Process images for AI
      const imageParts = await this.coreService.processImagesForAI(filteredImageUrls);

      // Initialize AI service
      const aiService = await this.coreService.initAIService();
      console.log(JSON.stringify(selectedFrameReviews , null, 2));

      // Prepare comment data for recheck
      const commentsByFrame = this.recheckService.prepareCommentsByFrame(selectedFrameReviews);
      return {}

      // Recheck designs
      //const recheckResult = await aiService.recheckDesign({
      //  imageParts,
     //   metadata,
     //   brandRules: brandGuideline.brandRules,
     //   commentsByFrame
     // });
//

      // Process recheck results and update frame reviews
      const updatedFrameReviews = await this.recheckService.processRecheckResults(
        sessionId,
        metadata,
        selectedFrameReviews,
        recheckResult
      );

      // Get the latest history entry
      const historyEntry = await prisma.reviewHistory.findFirst({
        where: { sessionId },
        orderBy: { timestamp: 'desc' }
      });

      // Return the result
      return {
        sessionId,
        brandId: session.brandGuidelineId,
        figmaUrl: session.figmaUrl,
        fileName: session.figmaFileName,
        updatedFrameReviews,
        historyEntry
      };
    } catch (error) {
      console.error('Error rechecking designs:', error);
      throw error;
    }
  }
}
