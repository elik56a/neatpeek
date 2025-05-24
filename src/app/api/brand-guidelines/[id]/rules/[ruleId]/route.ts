import { prisma } from "@/services/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Update a specific brand rule
 */
export async function PUT(req: NextRequest, context: { params: { id: string; ruleId: string } }) {
  // Extract the IDs from the context params
  const { id, ruleId } = await Promise.resolve(context.params);

  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to update a brand rule" },
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
    const brandGuideline = await prisma.brandGuideline.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!brandGuideline) {
      return NextResponse.json({ error: "Brand guideline not found" }, { status: 404 });
    }

    // Check if the user owns the brand guideline
    if (brandGuideline.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to update this brand rule" },
        { status: 403 }
      );
    }

    // Get the brand rule
    const brandRule = await prisma.brandRule.findUnique({
      where: { id: ruleId },
      select: { id: true, brandGuidelineId: true },
    });

    if (!brandRule) {
      return NextResponse.json({ error: "Brand rule not found" }, { status: 404 });
    }

    // Check if the brand rule belongs to the brand guideline
    if (brandRule.brandGuidelineId !== id) {
      return NextResponse.json(
        { error: "Brand rule does not belong to this brand guideline" },
        { status: 400 }
      );
    }

    // Get the request body
    const body = await req.json();

    // Update the brand rule without changing its position in the list
    const updatedBrandRule = await prisma.brandRule.update({
      where: { id: ruleId },
      data: {
        name: body.name,
        description: body.description,
        value: body.value,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedBrandRule);
  } catch (error) {
    console.error("Error updating brand rule:", error);
    return NextResponse.json({ error: "Failed to update brand rule" }, { status: 500 });
  }
}

/**
 * Delete a specific brand rule
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string; ruleId: string } }
) {
  // Extract the IDs from the context params
  const { id, ruleId } = await Promise.resolve(context.params);

  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to delete a brand rule" },
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
    const brandGuideline = await prisma.brandGuideline.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!brandGuideline) {
      return NextResponse.json({ error: "Brand guideline not found" }, { status: 404 });
    }

    // Check if the user owns the brand guideline
    if (brandGuideline.userId !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to delete this brand rule" },
        { status: 403 }
      );
    }

    // Get the brand rule
    const brandRule = await prisma.brandRule.findUnique({
      where: { id: ruleId },
      select: { id: true, brandGuidelineId: true },
    });

    if (!brandRule) {
      return NextResponse.json({ error: "Brand rule not found" }, { status: 404 });
    }

    // Check if the brand rule belongs to the brand guideline
    if (brandRule.brandGuidelineId !== id) {
      return NextResponse.json(
        { error: "Brand rule does not belong to this brand guideline" },
        { status: 400 }
      );
    }

    // Delete the brand rule
    await prisma.brandRule.delete({
      where: { id: ruleId },
    });

    return NextResponse.json({ message: "Brand rule deleted successfully" });
  } catch (error) {
    console.error("Error deleting brand rule:", error);
    return NextResponse.json({ error: "Failed to delete brand rule" }, { status: 500 });
  }
}
