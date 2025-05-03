/**
 * API route for reviewing designs
 *
 * This is a server-side only route that handles design review requests.
 */

import { prisma } from "@/services/db/prisma";
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

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, figmaAccessToken: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use user's Figma token if available, otherwise try to use the fallback token from env
    const figmaToken = user.figmaAccessToken || process.env.FIGMA_PERSONAL_ACCESS_TOKEN;

    if (!figmaToken) {
      return NextResponse.json(
        {
          error:
            "Figma access token not found. Please connect your Figma account or set FIGMA_PERSONAL_ACCESS_TOKEN in environment variables.",
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

    // Create design review service
    const designReviewService = new DesignReviewService(figmaToken);

    // Review design with selected frames
    const reviewResult = await designReviewService.analyzeDesign({
      figmaUrl,
      brandId,
      designType,
      selectedFrameIds, // Pass the selected frame IDs to the service
      userId: user.id, // Pass the user ID to the service
    });

    return NextResponse.json(reviewResult);
  } catch (error: any) {
    console.error("Error reviewing design:", error);
    return NextResponse.json(
      { error: error.message || "Failed to review design" },
      { status: 500 }
    );
  }
}
