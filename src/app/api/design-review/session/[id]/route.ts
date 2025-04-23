"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/services/db/prisma";
import { DesignReviewSessionService } from "@/features/design-review/services/design-review-session-service";

/**
 * GET /api/design-review/session/[id]
 * Get a design review session by ID
 */
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Get the session ID from the URL
    const params = await Promise.resolve(context?.params);
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view design reviews" },
        { status: 401 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create design review session service
    const sessionService = new DesignReviewSessionService();

    // Get the session
    const designReviewSession = await sessionService.getSessionById(id);

    if (!designReviewSession) {
      return NextResponse.json(
        { error: "Design review session not found" },
        { status: 404 }
      );
    }

    // Check if the user has access to this session
    if (designReviewSession.userId !== user.id) {
      // TODO: Add team-based access check here
      return NextResponse.json(
        { error: "You do not have permission to view this design review" },
        { status: 403 }
      );
    }

    // Return the session directly
    return NextResponse.json(designReviewSession);
  } catch (error: any) {
    console.error("Error fetching design review session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch design review session" },
      { status: 500 }
    );
  }
}
