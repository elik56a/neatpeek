/**
 * API route for rechecking designs
 *
 * This is a server-side only route that handles design recheck requests.
 */

import { prisma } from '@/services/db/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// We'll import the service dynamically to avoid client-side issues

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
      select: { id: true, figmaAccessToken: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.figmaAccessToken) {
      return NextResponse.json(
        { error: "Figma access token not found. Please connect your Figma account." },
        { status: 400 }
      );
    }

    // Get request body
    const body = await req.json();
    const { figmaUrl, brandId } = body;

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

    // Dynamically import the DesignReviewService
    const { DesignReviewService } = await import('@/features/design-review/services/design-review-service');

    // Create design review service
    const designReviewService = new DesignReviewService(user.figmaAccessToken);

    // Recheck design
    const recheckResult = await designReviewService.recheckDesign({
      figmaUrl,
      brandId
    });

    return NextResponse.json(recheckResult);
  } catch (error: any) {
    console.error("Error rechecking design:", error);
    return NextResponse.json(
      { error: error.message || "Failed to recheck design" },
      { status: 500 }
    );
  }
}
