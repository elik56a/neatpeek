import { brandSetupService } from "@/features/brand-setup/services";
import { prisma } from "@/services/db/prisma";
import { getServerSession } from "@/features/auth/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get a brand guideline by ID
 */
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  // Extract the ID from the context params
  const { id } = await Promise.resolve(context.params);
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view a brand guideline" },
        { status: 401 }
      );
    }

    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the brand guideline
    const brandGuideline = await brandSetupService.getBrandGuideline(id);

    if (!brandGuideline) {
      return NextResponse.json({ error: "Brand guideline not found" }, { status: 404 });
    }

    // Check if the user owns the brand guideline
    if (brandGuideline.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to view this brand guideline" },
        { status: 403 }
      );
    }

    return NextResponse.json(brandGuideline);
  } catch (error) {
    console.error("Error getting brand guideline:", error);

    return NextResponse.json({ error: "Failed to get brand guideline" }, { status: 500 });
  }
}

/**
 * Update a brand guideline
 */
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  // Extract the ID from the context params
  const { id } = await Promise.resolve(context.params);

  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to update a brand guideline" },
        { status: 401 }
      );
    }

    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the brand guideline
    const brandGuideline = await brandSetupService.getBrandGuideline(id);

    if (!brandGuideline) {
      return NextResponse.json({ error: "Brand guideline not found" }, { status: 404 });
    }

    // Check if the user owns the brand guideline
    if (brandGuideline.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to update this brand guideline" },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await req.json();

    // Update the brand guideline
    const updatedBrandGuideline = await brandSetupService.updateBrandGuideline({
      id,
      name: body.name,
      description: body.description,
    });

    return NextResponse.json(updatedBrandGuideline);
  } catch (error) {
    console.error("Error updating brand guideline:", error);
    return NextResponse.json({ error: "Failed to update brand guideline" }, { status: 500 });
  }
}

/**
 * Delete a brand guideline
 */
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  // Extract the ID from the context params
  const { id } = await Promise.resolve(context.params);
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to delete a brand guideline" },
        { status: 401 }
      );
    }

    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the brand guideline
    const brandGuideline = await brandSetupService.getBrandGuideline(id);

    if (!brandGuideline) {
      return NextResponse.json({ error: "Brand guideline not found" }, { status: 404 });
    }

    // Check if the user owns the brand guideline
    if (brandGuideline.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to delete this brand guideline" },
        { status: 403 }
      );
    }

    // Delete the brand guideline
    await brandSetupService.deleteBrandGuideline(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brand guideline:", error);

    return NextResponse.json({ error: "Failed to delete brand guideline" }, { status: 500 });
  }
}
