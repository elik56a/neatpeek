import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { companyService } from '@/features/company/services';
import { CompanyRole } from '@prisma/client';

/**
 * Get a company by ID
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
        { error: 'You must be logged in to view a company' },
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

    // Check if the user belongs to this company
    if (user.companyId !== id) {
      return NextResponse.json(
        { error: 'You do not have permission to view this company' },
        { status: 403 }
      );
    }

    // Get the company
    const company = await companyService.getCompany(id);

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error getting company:', error);
    return NextResponse.json(
      { error: 'Failed to get company' },
      { status: 500 }
    );
  }
}

/**
 * Update a company
 */
export async function PUT(
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
        { error: 'You must be logged in to update a company' },
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

    // Check if the user belongs to this company and has admin/owner role
    if (user.companyId !== id || 
        (user.companyRole !== CompanyRole.OWNER && user.companyRole !== CompanyRole.ADMIN)) {
      return NextResponse.json(
        { error: 'You do not have permission to update this company' },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await req.json();

    // Update the company
    const company = await companyService.updateCompany({
      id,
      name: body.name,
      domain: body.domain,
      logo: body.logo,
      settings: body.settings,
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}

/**
 * Delete a company
 */
export async function DELETE(
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
        { error: 'You must be logged in to delete a company' },
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

    // Check if the user is the company owner
    if (user.companyId !== id || user.companyRole !== CompanyRole.OWNER) {
      return NextResponse.json(
        { error: 'Only the company owner can delete the company' },
        { status: 403 }
      );
    }

    // Get all users in the company
    const companyUsers = await prisma.user.findMany({
      where: { companyId: id },
    });

    // Remove company association from all users
    await prisma.user.updateMany({
      where: { companyId: id },
      data: {
        companyId: null,
        companyRole: CompanyRole.MEMBER,
      },
    });

    // Delete the company
    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
