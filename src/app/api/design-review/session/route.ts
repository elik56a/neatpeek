"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/services/db/prisma";
import { DesignReviewSessionService } from "@/features/design-review/services/design-review-session-service";
import { SessionAnalysisInput } from "@/features/design-review/types";

/**
 * POST /api/design-review/session
 * Create a new design review session
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to create a design review" },
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
    const { figmaUrl, brandId, selectedFrameIds } = body;

    // Validate input
    if (!figmaUrl) {
      return NextResponse.json(
        { error: "Figma URL is required" },
        { status: 400 }
      );
    }

    if (!brandId) {
      return NextResponse.json(
        { error: "Brand ID is required" },
        { status: 400 }
      );
    }

    // Create input object
    const input: SessionAnalysisInput = {
      figmaUrl,
      brandId,
      userId: user.id,
      selectedFrameIds
    };

    // Create design review session service
    const sessionService = new DesignReviewSessionService();

    // Analyze designs
    const result = await sessionService.analyzeDesigns(input);

    // Return the result
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error creating design review session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create design review session" },
      { status: 500 }
    );
  }
}
