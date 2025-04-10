import { prisma } from '@/services/db/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

/**
 * Get all brands the current user has access to
 * This includes:
 * - Brands created by the user
 * - Brands belonging to the user's company
 * - Brands belonging to teams the user is a member of
 */
export async function GET() {
  try {
    console.log('Fetching accessible brands...');

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      console.log('No authenticated user found');
      return NextResponse.json(
        { error: 'You must be logged in to view brands' },
        { status: 401 }
      );
    }

    // Get the user with company info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        companyId: true,
        teams: {
          select: {
            teamId: true
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get team IDs the user is a member of
    const teamIds = user.teams.map(team => team.teamId);

    // Create conditions for the OR array
    const conditions: any[] = [
      { userId: user.id },  // Brands created by the user
    ];

    // Add company condition if user has a company
    if (user.companyId) {
      conditions.push({ companyId: user.companyId });
    }

    // Add team condition if user is in any teams
    if (teamIds.length > 0) {
      conditions.push({ teamId: { in: teamIds } });
    }

    // Fetch all brands the user has access to
    const brands = await prisma.brand.findMany({
      where: {
        OR: conditions
      },
      select: {
        id: true,
        name: true,
        description: true,
        brandRules: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`Found ${brands.length} accessible brands`);
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}
