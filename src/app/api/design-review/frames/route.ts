/**
 * API route for getting frames from a Figma file
 *
 * This is a server-side only route that handles fetching frames from Figma.
 */

import { prisma } from "@/services/db/prisma";
import { TokenService } from "@/services/tokens";
import { getServerSession } from "@/features/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { FigmaAuthError } from "@/features/design-review/services/figma-service";
import { PROVIDERS } from "@/features/auth/config/providers";

export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "You must be logged in to get frames" }, { status: 401 });
    }

    // Get the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, figmaTokenExpiry: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get Figma tokens from TokenService
    const figmaTokens = await TokenService.getFigmaTokens(user.id, user.figmaTokenExpiry);

    if (!figmaTokens.accessToken || !figmaTokens.refreshToken) {
      return NextResponse.json(
        {
          error: "Figma tokens not found. Please connect your Figma account.",
        },
        { status: 400 }
      );
    }

    // Get request body
    const body = await req.json();
    const { figmaUrl } = body;

    if (!figmaUrl) {
      return NextResponse.json({ error: "Figma URL is required" }, { status: 400 });
    }

    // Dynamically import the FigmaService
    const { FigmaService } = await import("@/features/design-review/services/figma-service");

    // Create Figma service with the token
    const figmaService = new FigmaService(figmaTokens.accessToken);

    // Extract designs from Figma
    const { metadata } = await figmaService.getAllFramesFromFigmaUrl(figmaUrl);

    // Return frames with image URLs
    return NextResponse.json({
      fileKey: metadata.fileKey,
      fileName: metadata.fileName,
      frames: metadata.frames.map(frame => ({
        id: frame.id,
        name: frame.name,
        imageUrl: frame.url,
        width: frame.position.width,
        height: frame.position.height,
      })),
    });
  } catch (error: any) {
    console.error("Error getting frames:", error);

    // Handle Figma authentication errors
    if (error instanceof FigmaAuthError) {
      return NextResponse.json(
        {
          requiresAuth: true,
          redirectTo: PROVIDERS.figma.id,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: "Failed to get frames" }, { status: 500 });
  }
}
