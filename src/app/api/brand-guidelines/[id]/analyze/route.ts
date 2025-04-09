import { brandSetupService } from "@/features/brand-setup/services";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Start the analysis process for a brand guideline
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Extract the ID from params to avoid Next.js warnings
  const { id } = await Promise.resolve(params);
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to analyze a brand guideline" },
        { status: 401 }
      );
    }

    // Get the user ID
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

    // Get the brand guideline
    const brandGuideline = await brandSetupService.getBrandGuideline(id);

    if (!brandGuideline) {
      return NextResponse.json(
        { error: "Brand guideline not found" },
        { status: 404 }
      );
    }

    // Check if the user owns the brand guideline
    if (brandGuideline.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to analyze this brand guideline" },
        { status: 403 }
      );
    }

    // Check if the brand guideline has at least one of: PDF, design images, or custom rules
    const hasPdf = !!brandGuideline.pdfPath;
    const hasDesignImages = brandGuideline.designImages && brandGuideline.designImages.length > 0;
    const hasCustomRules = brandGuideline.customRules && brandGuideline.customRules.length > 0;

    if (!hasPdf && !hasDesignImages && !hasCustomRules) {
      return NextResponse.json(
        { error: "Brand guideline must have at least one of: PDF, design images, or custom rules" },
        { status: 400 }
      );
    }

    // Start the analysis
    const updatedBrandGuideline = await brandSetupService.startAnalysis(id);

    return NextResponse.json(updatedBrandGuideline);
  } catch (error) {
    console.error("Error starting analysis:", error);

    return NextResponse.json(
      { error: "Failed to start analysis" },
      { status: 500 }
    );
  }
}
