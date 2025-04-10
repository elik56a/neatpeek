import { brandSetupService } from "@/features/brand-setup/services";
import { prisma } from "@/services/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for creating a brand guideline
const createBrandGuidelineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  companyId: z.string().optional(),
  teamId: z.string().optional(),
});

/**
 * Create a new brand guideline
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to create a brand guideline" },
        { status: 401 }
      );
    }

    // Get the user ID and company info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      // @ts-ignore - TypeScript doesn't know about our custom fields
      select: { id: true, companyId: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse the request body
    const body = await req.json();

    // Validate the request body
    const validatedData = createBrandGuidelineSchema.parse(body);

    // Validate company and team IDs
    // @ts-ignore - TypeScript doesn't know about our custom fields
    let companyId = validatedData.companyId || user.companyId || null;
    let teamId = validatedData.teamId || null;

    // If team is specified, verify it belongs to the user's company
    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        // @ts-ignore - TypeScript doesn't know about our custom fields
        select: { companyId: true },
      });

      if (!team) {
        return NextResponse.json(
          { error: "Team not found" },
          { status: 404 }
        );
      }

      // Ensure the team belongs to the user's company
      // @ts-ignore - TypeScript doesn't know about our custom fields
      if (companyId && team.companyId !== companyId) {
        return NextResponse.json(
          { error: "Team does not belong to the specified company" },
          { status: 400 }
        );
      }

      // If no company was specified, use the team's company
      if (!companyId) {
        // @ts-ignore - TypeScript doesn't know about our custom fields
        companyId = team.companyId;
      }
    }

    // Create the brand guideline
    const brandGuideline = await brandSetupService.createBrandGuideline({
      userId: user.id,
      name: validatedData.name,
      description: validatedData.description,
      companyId: companyId,
      teamId: teamId,
    });

    return NextResponse.json(brandGuideline, { status: 201 });
  } catch (error) {
    console.error("Error creating brand guideline:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create brand guideline" },
      { status: 500 }
    );
  }
}

/**
 * Get all brand guidelines for the current user
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view brand guidelines" },
        { status: 401 }
      );
    }

    // Get the user ID and company info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      // @ts-ignore - TypeScript doesn't know about our custom fields
      select: { id: true, companyId: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    // @ts-ignore - TypeScript doesn't know about our custom fields
    const companyId = url.searchParams.get('companyId') || user.companyId;
    const teamId = url.searchParams.get('teamId');

    // Get brand guidelines based on filters
    let brandGuidelines: any[];

    if (companyId && !teamId) {
      // Get all brand guidelines for the company
      brandGuidelines = await brandSetupService.getBrandGuidelinesForCompany(companyId);
    } else if (teamId) {
      // Get all brand guidelines for the team
      brandGuidelines = await brandSetupService.getBrandGuidelinesForTeam(teamId);
    } else {
      // Get all brand guidelines for the user
      brandGuidelines = await brandSetupService.getBrandGuidelinesForUser(user.id);
    }

    return NextResponse.json(brandGuidelines);
  } catch (error) {
    console.error("Error getting brand guidelines:", error);

    return NextResponse.json(
      { error: "Failed to get brand guidelines" },
      { status: 500 }
    );
  }
}
