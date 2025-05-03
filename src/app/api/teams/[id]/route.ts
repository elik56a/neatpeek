import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/services/db/prisma";
import { CompanyRole } from "@prisma/client";

/**
 * Get a team by ID
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract the ID from params
    const { id } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view team details" },
        { status: 401 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, companyId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the team
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if the user belongs to the same company as the team
    if (user.companyId !== team.companyId) {
      return NextResponse.json(
        { error: "You do not have permission to view this team" },
        { status: 403 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error getting team:", error);
    return NextResponse.json({ error: "Failed to get team" }, { status: 500 });
  }
}

/**
 * Update a team
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract the ID from params
    const { id } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to update a team" },
        { status: 401 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, companyId: true, companyRole: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the team
    const team = await prisma.team.findUnique({
      where: { id },
      select: { companyId: true, ownerId: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if the user belongs to the same company as the team
    if (user.companyId !== team.companyId) {
      return NextResponse.json(
        { error: "You do not have permission to update this team" },
        { status: 403 }
      );
    }

    // Check if the user is a company admin or the team owner
    const isTeamOwner = team.ownerId === user.id;
    const isCompanyAdmin =
      user.companyRole === CompanyRole.ADMIN || user.companyRole === CompanyRole.OWNER;

    if (!isTeamOwner && !isCompanyAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to update this team" },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await req.json();

    // Validate the request body
    if (!body.name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    // Update the team
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
      },
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
  }
}

/**
 * Delete a team
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract the ID from params
    const { id } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to delete a team" },
        { status: 401 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, companyId: true, companyRole: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the team
    const team = await prisma.team.findUnique({
      where: { id },
      select: { companyId: true, ownerId: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if the user belongs to the same company as the team
    if (user.companyId !== team.companyId) {
      return NextResponse.json(
        { error: "You do not have permission to delete this team" },
        { status: 403 }
      );
    }

    // Check if the user is a company admin or the team owner
    const isTeamOwner = team.ownerId === user.id;
    const isCompanyAdmin =
      user.companyRole === CompanyRole.ADMIN || user.companyRole === CompanyRole.OWNER;

    if (!isTeamOwner && !isCompanyAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to delete this team" },
        { status: 403 }
      );
    }

    // Delete the team
    await prisma.team.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
  }
}
