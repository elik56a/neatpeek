/**
 * API route for fetching design review history
 *
 * This is a server-side only route that handles design review history requests.
 */

import { prisma } from '@/services/db/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

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
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    // First check if the reviewId is a session ID
    const designSession = await prisma.designReviewSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    console.log({
      designSession,
      user
    })

    if (!designSession) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

      // This is a session ID
      if (designSession.userId !== user.id) {
        return NextResponse.json(
          { error: "You don't have permission to view this review history" },
          { status: 403 }
        );
      }

      // Fetch review history for the session
      const history = await prisma.reviewHistory.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'desc' },
      });

      return NextResponse.json(history);

  } catch (error: any) {
    console.error("Error fetching review history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch review history" },
      { status: 500 }
    );
  }
}
