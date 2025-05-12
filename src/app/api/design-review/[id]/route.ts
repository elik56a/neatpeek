/**
 * API route for fetching a design review by ID
 *
 * This is a server-side only route that handles design review requests.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/services/db/prisma";
import { ReviewStatus } from "@/features/design-review/types";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dynamically import the DesignReviewService
    const { DesignReviewService } = await import(
      "@/features/design-review/services/design-review-service"
    );
    const designReviewService = DesignReviewService.getInstance();
    const { id } = await params;

    const review = await designReviewService.getDesignsReview(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error getting review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!Object.values(ReviewStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update the review status
    const review = await prisma.designsReview.update({
      where: { id: params.id },
      data: { status },
      include: {
        brandGuideline: true,
        designs: true,
        reviewHistory: true,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
