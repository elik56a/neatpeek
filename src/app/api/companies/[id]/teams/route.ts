import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { CompanyRole } from '@prisma/client';

/**
 * Get all teams for a company
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
        { error: 'You must be logged in to view company teams' },
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

    // Check if the user belongs to this company
    if (user.companyId !== id) {
      return NextResponse.json(
        { error: 'You do not have permission to view teams of this company' },
        { status: 403 }
      );
    }

    // Get all teams for the company
    const teams = await prisma.team.findMany({
      where: { companyId: id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error getting company teams:', error);
    return NextResponse.json(
      { error: 'Failed to get company teams' },
      { status: 500 }
    );
  }
}

/**
 * Create a new team for a company
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
        { error: 'You must be logged in to create a team' },
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

    // Check if the user is an admin or owner of this company
    if (
      user.companyId !== id ||
      (user.companyRole !== CompanyRole.ADMIN && user.companyRole !== CompanyRole.OWNER)
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to create teams for this company' },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await req.json();

    // Validate the request body
    if (!body.name) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Create the team
    const team = await prisma.team.create({
      data: {
        name: body.name,
        description: body.description,
        companyId: id,
        ownerId: user.id,
        members: {
          connect: { id: user.id },
        },
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
