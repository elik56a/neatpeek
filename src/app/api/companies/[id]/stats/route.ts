import { prisma } from '@/services/db/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Store a map of company IDs to timestamps to prevent excessive API calls
const companyChecks = new Map<string, number>();

// Only allow one check per company every 5 seconds
const THROTTLE_TIME = 5000; // 5 seconds

/**
 * Get statistics for a company
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract the ID from params
    const { id } = await Promise.resolve(params);

    // Check if this company has been queried recently
    const lastCheck = companyChecks.get(id);
    const now = Date.now();

    if (lastCheck && now - lastCheck < THROTTLE_TIME) {
      return NextResponse.json({ throttled: true }, { status: 429 });
    }

    // Update the last check time
    companyChecks.set(id, now);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to view company statistics' },
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
        { error: 'You do not have permission to view statistics for this company' },
        { status: 403 }
      );
    }

    // Get company statistics
    const [memberCount, teamCount, brandCount] = await Promise.all([
      // Count company members
      prisma.user.count({
        where: { companyId: id },
      }),
      // Count company teams
      prisma.team.count({
        where: { companyId: id },
      }),
      // Count company brand guidelines
      prisma.brandGuideline.count({
        where: { companyId: id },
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
        type: 'team_created',
        title: 'New team created',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        user: {
          name: session.user.name || 'User',
          email: session.user.email,
        },
      },
    ];

    return NextResponse.json({
      memberCount,
      teamCount,
      brandCount,
      recentActivity,
    });
  } catch (error) {
    console.error('Error getting company statistics:', error);
    return NextResponse.json(
      { error: 'Failed to get company statistics' },
      { status: 500 }
    );
  }
}
