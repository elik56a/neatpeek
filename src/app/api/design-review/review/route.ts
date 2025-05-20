/**
 * API route for reviewing designs
 *
 * This is a server-side only route that handles design review requests.
 */

import { prisma } from "@/services/db/prisma";
import { TokenService } from "@/services/tokens";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// We'll import the service dynamically to avoid client-side issues

export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to review designs" },
        { status: 401 }
      );
    }

    // Get the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get Figma access token from TokenService
    const figmaToken = await TokenService.getFigmaAccessToken(user.id);

    if (!figmaToken) {
      return NextResponse.json(
        {
          error: "Figma access token not found. Please connect your Figma account.",
        },
        { status: 400 }
      );
    }

    // Get request body
    const body = await req.json();
    const { figmaUrl, brandId, designType, selectedFrameIds } = body;

    if (!figmaUrl) {
      return NextResponse.json({ error: "Figma URL is required" }, { status: 400 });
    }

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
    }

    // Dynamically import the DesignReviewService
    const { DesignReviewService } = await import(
      "@/features/design-review/services/design-review-service"
    );

    const designReviewService = DesignReviewService.getInstance(figmaToken);

    const designsReviewId = await designReviewService.analyzeDesigns({
      figmaUrl,
      brandId,
      designType,
      selectedFrameIds,
      userId: user.id,
    });

    const review = await designReviewService.getDesignsReview(designsReviewId);

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("Error reviewing design:", error);
    return NextResponse.json({ error: "Failed to review design" }, { status: 500 });
  }
}
