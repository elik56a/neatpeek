import { companyService } from '@/features/company/services';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Create a new company
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to create a company' },
        { status: 401 }
      );
    }

    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the request body
    const body = await req.json();

    // Validate the request body
    if (!body.name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Create the company
    const company = await companyService.createCompany({
      name: body.name,
      domain: body.domain,
      logo: body.logo,
      ownerId: user.id,
    });

    // Get the updated user with company role
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        companyId: true,
        companyRole: true,
      },
    });

    return NextResponse.json({
      company,
      user: updatedUser,
      message: "Company created successfully. Please refresh the page or log out and log back in to see the changes."
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}

/**
 * Get all companies for the current user
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to view companies' },
        { status: 401 }
      );
    }

    // Get the user with company
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If the user has a company, return it
    if (user.company) {
      return NextResponse.json([user.company]);
    }

    // Otherwise, return an empty array
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error getting companies:', error);
    return NextResponse.json(
      { error: 'Failed to get companies' },
      { status: 500 }
    );
  }
}
