import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { CompanyRole } from '@prisma/client';

/**
 * Remove a member from a team
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    // Extract the IDs from params
    const { id, memberId } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to remove team members' },
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
        { error: 'You do not have permission to remove members from this team' },
        { status: 403 }
      );
    }

    // Check if the user is a company admin or the team owner
    const isTeamOwner = team.ownerId === user.id;
    const isCompanyAdmin = user.companyRole === CompanyRole.ADMIN || user.companyRole === CompanyRole.OWNER;

    if (!isTeamOwner && !isCompanyAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to remove members from this team' },
        { status: 403 }
      );
    }

    // Check if the member to remove is the team owner
    if (memberId === team.ownerId) {
      return NextResponse.json(
        { error: 'Cannot remove the team owner' },
        { status: 400 }
      );
    }

    // Check if the member is part of the team
    const isMember = await prisma.team.findFirst({
      where: {
        id,
        members: {
          some: {
            id: memberId,
          },
        },
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { error: 'User is not a member of this team' },
        { status: 400 }
      );
    }

    // Remove the member from the team
    await prisma.team.update({
      where: { id },
      data: {
        members: {
          disconnect: { id: memberId },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}
