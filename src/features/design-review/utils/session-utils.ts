/**
 * Utility functions for design review sessions
 */
import { prisma } from "@/lib/prisma";
import { 
  DesignReviewSession, 
  ReviewStatus,
  ReviewHistoryAction,
  HistoryChanges
} from "../types";

/**
 * Create a new design review session
 * @param data Session data
 * @returns Created session
 */
export async function createSession(data: {
  userId: string;
  brandGuidelineId: string;
  figmaUrl: string;
  figmaFileKey: string;
  figmaFileName: string;
  status?: ReviewStatus;
}): Promise<DesignReviewSession> {
  try {
    const session = await prisma.designReviewSession.create({
      data: {
        userId: data.userId,
        brandGuidelineId: data.brandGuidelineId,
        figmaUrl: data.figmaUrl,
        figmaFileKey: data.figmaFileKey,
        figmaFileName: data.figmaFileName,
        status: data.status || ReviewStatus.PENDING
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
export async function getSessionById(id: string) {
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
 * Create a history entry for a session
 * @param data History entry data
 * @returns Created history entry
 */
export async function createHistoryEntry(data: {
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
        changes: data.changes as any,
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
 * @returns Updated session
 */
export async function updateSessionStatus(sessionId: string, status: ReviewStatus) {
  try {
    const session = await prisma.designReviewSession.update({
      where: { id: sessionId },
      data: { status }
    });

    return session;
  } catch (error) {
    console.error('Error updating session status:', error);
    throw error;
  }
}
