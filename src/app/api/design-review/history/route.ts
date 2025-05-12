/**
 * API route for fetching design review history
 *
 * This is a server-side only route that handles design review history requests.
 */

import { prisma } from "@/services/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view design review history" },
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

    // Get query parameters
    const url = new URL(req.url);
    const designsReviewId = url.searchParams.get("designsReviewId");

    if (!designsReviewId) {
      return NextResponse.json({ error: "Designs Review ID is required" }, { status: 400 });
    }

    // Check if the designs review belongs to the user
    const designsReview = await prisma.designsReview.findUnique({
      where: { id: designsReviewId },
      select: { userId: true },
    });

    if (!designsReview) {
      return NextResponse.json({ error: "Designs Review not found" }, { status: 404 });
    }

    if (designsReview.userId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to view this review history" },
        { status: 403 }
      );
    }

    // Fetch review history
    const history = await prisma.reviewHistory.findMany({
      where: { designsReviewId },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("Error fetching review history:", error);
    return NextResponse.json(
      { error: "Failed to fetch review history" },
      { status: 500 }
    );
  }
}
