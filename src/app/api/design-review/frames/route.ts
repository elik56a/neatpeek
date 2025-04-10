/**
 * API route for getting frames from a Figma file
 *
 * This is a server-side only route that handles fetching frames from Figma.
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
        { error: "You must be logged in to get frames" },
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
    const { figmaUrl } = body;

    if (!figmaUrl) {
      return NextResponse.json(
        { error: "Figma URL is required" },
        { status: 400 }
      );
    }

    // Dynamically import the FigmaService
    const { FigmaService } = await import('@/features/design-review/services/figma-service');

    // Create Figma service
    const figmaService = new FigmaService(user.figmaAccessToken);

    // Extract designs from Figma
    const { metadata } = await figmaService.extractDesignsFromFigma(figmaUrl);

    // Return frames with image URLs
    return NextResponse.json({
      fileKey: metadata.fileKey,
      fileName: metadata.fileName,
      frames: metadata.frames.map((frame: any) => ({
        id: frame.id,
        name: frame.name,
        imageUrl: frame.url,
        width: frame.position.width,
        height: frame.position.height
      }))
    });
  } catch (error: any) {
    console.error("Error getting frames:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get frames" },
      { status: 500 }
    );
  }
}
