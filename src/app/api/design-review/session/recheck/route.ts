"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/services/db/prisma";
import { DesignReviewSessionService } from "@/features/design-review/services/design-review-session-service";
import { SessionRecheckInput } from "@/features/design-review/types";

/**
 * POST /api/design-review/session/recheck
 * Recheck designs in a session
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to recheck designs" },
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

    // Get request body
    const body = await req.json();
    const { sessionId, frameIds } = body;

    // Validate input
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (!frameIds || !Array.isArray(frameIds) || frameIds.length === 0) {
      return NextResponse.json(
        { error: "At least one frame ID is required" },
        { status: 400 }
      );
    }

    // Get the session to check permissions
    const designReviewSession = await prisma.designReviewSession.findUnique({
      where: { id: sessionId }
    });

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
        { error: "You do not have permission to recheck this design review" },
        { status: 403 }
      );
    }

    // Create input object
    const input: SessionRecheckInput = {
      sessionId,
      frameIds,
      userId: user.id
    };

    // Create design review session service
    const sessionService = new DesignReviewSessionService();

    // Recheck designs
    const result = await sessionService.recheckDesigns(input);

    // Return the result
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error rechecking designs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to recheck designs" },
      { status: 500 }
    );
  }
}
