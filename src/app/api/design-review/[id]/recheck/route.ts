import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server";
import type { DesignRecheckInput } from "@/features/design-review/types";
import { TokenService } from "@/services/tokens";
import { prisma } from "@/services/db/prisma";
import { FigmaAuthError } from "@/features/design-review/services/figma-service";
import { PROVIDERS } from "@/features/auth/config/providers";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    if (!figmaTokens.accessToken) {
      return NextResponse.json(
        { error: "Figma access token not found. Please connect your Figma account." },
        { status: 400 }
      );
    }

    // Parse and type the request body as DesignRecheckInput
    const body = (await request.json()) as DesignRecheckInput;
    const { designsReviewId, brandId, userId, frameIds } = body;

    // Dynamically import the DesignReviewService
    const { DesignReviewService } = await import(
      "@/features/design-review/services/design-review-service"
    );
    const designReviewService = DesignReviewService.getInstance(figmaTokens.accessToken);

    // Call the recheck logic (assume recheckDesigns method exists and is correct)
    const result = await designReviewService.recheckDesigns({
      designsReviewId,
      brandId,
      userId,
      frameIds,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error rechecking design review:", error);

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

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
