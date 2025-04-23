/**
 * API route for analyzing designs
 *
 * This is a server-side only route that handles design analysis requests.
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
        { error: "You must be logged in to analyze designs" },
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
    const { figmaUrl, brandId, designType } = body;

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

    // Analyze design
    const analysisResult = await designReviewService.analyzeDesign({
      figmaUrl,
      brandId,
      designType,
      userId: user.id // Pass the user ID to the service
    });

    return NextResponse.json(analysisResult);
  } catch (error: any) {
    console.error("Error analyzing design:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze design" },
      { status: 500 }
    );
  }
}
