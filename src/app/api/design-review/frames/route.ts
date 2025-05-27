/**
 * API route for getting frames from a Figma file
 *
 * This is a server-side only route that handles fetching frames from Figma.
 */

import { prisma } from "@/services/db/prisma";
import { TokenService } from "@/services/tokens";
import { getServerSession } from "@/features/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { ensureFreshFigmaToken } from "@/features/auth/utils/figma-refresh-token";

// We'll import the service dynamically to avoid client-side issues

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
    const currentFigmaTokens = await TokenService.getFigmaTokens(user.id, user.figmaTokenExpiry);

    if (!currentFigmaTokens.accessToken || !currentFigmaTokens.refreshToken) {
      return NextResponse.json(
        {
          error: "Figma tokens not found. Please connect your Figma account.",
        },
        { status: 400 }
      );
    }

    // Ensure token is fresh - this will refresh if needed
    const tokenToUse = await ensureFreshFigmaToken(currentFigmaTokens);

    // Get request body
    const body = await req.json();
    const { figmaUrl } = body;

    if (!figmaUrl) {
      return NextResponse.json({ error: "Figma URL is required" }, { status: 400 });
    }

    // Dynamically import the FigmaService
    const { FigmaService } = await import("@/features/design-review/services/figma-service");

    // Create Figma service with the token
    const figmaService = new FigmaService(tokenToUse.accessToken as string);

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

    // Provide more specific error message if it's a Figma API auth error
    if (error.message?.includes("403") || error.message?.includes("authentication")) {
      return NextResponse.json(
        { error: "Figma authentication failed. Please reconnect your Figma account." },
        { status: 403 }
      );
    }

    // Handle invalid_grant errors from token refresh
    if (error.message?.includes("invalid_grant")) {
      return NextResponse.json(
        {
          error:
            "Your Figma connection has expired. Please disconnect and reconnect your Figma account.",
          code: "INVALID_GRANT",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: "Failed to get frames" }, { status: 500 });
  }
}
