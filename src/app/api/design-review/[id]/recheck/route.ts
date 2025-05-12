import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import type { DesignRecheckInput } from "@/features/design-review/types";
import { prisma } from "@/services/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, figmaAccessToken: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse and type the request body as DesignRecheckInput
    const body = (await request.json()) as DesignRecheckInput;
    const { designsReviewId, brandId, userId, frameIds } = body;

    // Dynamically import the DesignReviewService
    const { DesignReviewService } = await import(
      "@/features/design-review/services/design-review-service"
    );
    const designReviewService = DesignReviewService.getInstance(user.figmaAccessToken);

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
