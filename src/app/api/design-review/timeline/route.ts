/**
 * API route for fetching design timeline history
 *
 * This is a server-side only route that handles design timeline history
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
    const designId = url.searchParams.get("designId");

    if (!designId) {
      return NextResponse.json({ error: "Designs ID is required" }, { status: 400 });
    }

    // Check if the designs review belongs to the user
    const designsReview = await prisma.design.findUnique({
      where: { id: designId },
      select: { userId: true },
    });

    if (!designsReview) {
      return NextResponse.json({ error: "Designs not found" }, { status: 404 });
    }

    if (designsReview.userId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to view this review timeline" },
        { status: 403 }
      );
    }

    // Fetch the design review timeline history
    const history = await prisma.designTimeline.findMany({
      where: { designId },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("Error fetching review history:", error);
    return NextResponse.json({ error: "Failed to fetch review history" }, { status: 500 });
  }
}
