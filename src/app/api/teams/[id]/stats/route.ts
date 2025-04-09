import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

/**
 * Get statistics for a team
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
        { error: 'You must be logged in to view team statistics' },
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
        { error: 'You do not have permission to view statistics for this team' },
        { status: 403 }
      );
    }

    // Get team statistics
    const [memberCount, brandCount] = await Promise.all([
      // Count team members
      prisma.user.count({
        where: {
          teams: {
            some: {
              id,
            },
          },
        },
      }),
      // Count team brand guidelines
      prisma.brandGuideline.count({
        where: { teamId: id },
      }),
    ]);

    // Get recent activity (mock data for now)
    // In a real application, you would fetch this from a dedicated activity log table
    const recentActivity = [
      {
        id: '1',
        type: 'brand_created',
        title: 'New brand guideline created',
        date: new Date().toISOString(),
        user: {
          name: session.user.name || 'User',
          email: session.user.email,
        },
      },
      {
        id: '2',
        type: 'member_added',
        title: 'New member added to team',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        user: {
          name: session.user.name || 'User',
          email: session.user.email,
        },
      },
    ];

    return NextResponse.json({
      memberCount,
      brandCount,
      recentActivity,
    });
  } catch (error) {
    console.error('Error getting team statistics:', error);
    return NextResponse.json(
      { error: 'Failed to get team statistics' },
      { status: 500 }
    );
  }
}
