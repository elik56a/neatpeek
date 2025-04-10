import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/services/db/prisma';
import { CompanyRole } from '@prisma/client';

/**
 * Get all members of a team
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract the ID from params
    const { id } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to view team members' },
        { status: 401 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, companyId: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the team
    const team = await prisma.team.findUnique({
      where: { id },
      select: { companyId: true },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if the user belongs to the same company as the team
    if (user.companyId !== team.companyId) {
      return NextResponse.json(
        { error: 'You do not have permission to view members of this team' },
        { status: 403 }
      );
    }

    // Get all members of the team
    const members = await prisma.user.findMany({
      where: {
        teams: {
          some: {
            id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        companyRole: true,
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error getting team members:', error);
    return NextResponse.json(
      { error: 'Failed to get team members' },
      { status: 500 }
    );
  }
}

/**
 * Add a member to a team
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract the ID from params
    const { id } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to add team members' },
        { status: 401 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, companyId: true, companyRole: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the team
    const team = await prisma.team.findUnique({
      where: { id },
      select: { companyId: true, ownerId: true },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check if the user belongs to the same company as the team
    if (user.companyId !== team.companyId) {
      return NextResponse.json(
        { error: 'You do not have permission to add members to this team' },
        { status: 403 }
      );
    }

    // Check if the user is a company admin or the team owner
    const isTeamOwner = team.ownerId === user.id;
    const isCompanyAdmin = user.companyRole === CompanyRole.ADMIN || user.companyRole === CompanyRole.OWNER;

    if (!isTeamOwner && !isCompanyAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to add members to this team' },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await req.json();

    // Validate the request body
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the user to add
    const userToAdd = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, companyId: true },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the user to add belongs to the same company
    if (userToAdd.companyId !== team.companyId) {
      return NextResponse.json(
        { error: 'User does not belong to the same company' },
        { status: 400 }
      );
    }

    // Check if the user is already a member of the team
    const isMember = await prisma.team.findFirst({
      where: {
        id,
        members: {
          some: {
            id: userToAdd.id,
          },
        },
      },
    });

    if (isMember) {
      return NextResponse.json(
        { error: 'User is already a member of this team' },
        { status: 400 }
      );
    }

    // Add the user to the team
    await prisma.team.update({
      where: { id },
      data: {
        members: {
          connect: { id: userToAdd.id },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    );
  }
}
