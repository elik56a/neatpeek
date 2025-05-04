/**
 * API route for fetching a design review by ID
 *
 * This is a server-side only route that handles design review requests.
 */

import { prisma } from "@/services/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    // Get the design review ID from the URL
    const params = await Promise.resolve(context?.params);
    const id = params?.id;

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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    // Fetch the design review
    const review = await prisma.designReview.findUnique({
      where: { id },
      include: {
        frame: {
          select: {
            frameId: true,
            name: true,
            figmaFileKey: true,
            figmaFileName: true,
          },
        },
        brandGuideline: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Now that we've regenerated the Prisma client, we can fetch the originalFigmaUrl
    const reviewWithUrl = await prisma.designReview.findUnique({
      where: { id },
      select: {
        originalFigmaUrl: true,
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Check if the review belongs to the user
    if (review.userId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to view this review" },
        { status: 403 }
      );
    }

    // Format the response to match the DesignAnalysisResult structure
    const formattedReview = {
      reviews: [
        {
          image: {
            frame_id: review.frame.frameId,
            name: review.frame.name,
          },
          ...(review.reviewJson as any),
        },
      ],
      brandId: review.brandGuidelineId,
      figmaUrl: reviewWithUrl?.originalFigmaUrl,
      fileName: review.frame.figmaFileName,
      reviewId: review.id,
    };

    return NextResponse.json(formattedReview);
  } catch (error: any) {
    console.error("Error fetching design review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch design review" },
      { status: 500 }
    );
  }
}
