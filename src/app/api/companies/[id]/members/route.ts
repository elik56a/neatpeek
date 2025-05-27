import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server";
import { prisma } from "@/services/db/prisma";
import { companyService } from "@/features/company/services";
import { CompanyRole } from "@prisma/client";

/**
 * Get all members of a company
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract the ID from params
    const { id } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view company members" },
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

    // Check if the user belongs to this company
    if (user.companyId !== id) {
      return NextResponse.json(
        { error: "You do not have permission to view members of this company" },
        { status: 403 }
      );
    }

    // Get all members of the company
    const members = await companyService.getCompanyMembers(id);

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error getting company members:", error);
    return NextResponse.json({ error: "Failed to get company members" }, { status: 500 });
  }
}

/**
 * Add a member to a company (used by admins to directly add users)
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract the ID from params
    const { id } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to add company members" },
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

    // Check if the user is an admin or owner of this company
    if (
      user.companyId !== id ||
      (user.companyRole !== CompanyRole.ADMIN && user.companyRole !== CompanyRole.OWNER)
    ) {
      return NextResponse.json(
        { error: "You do not have permission to add members to this company" },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await req.json();

    // Validate the request body
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find the user to add
    const userToAdd = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, companyId: true },
    });

    if (!userToAdd) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user is already in a company
    if (userToAdd.companyId) {
      return NextResponse.json({ error: "User is already a member of a company" }, { status: 400 });
    }

    // Add the user to the company
    const updatedUser = await companyService.addUserToCompany({
      userId: userToAdd.id,
      companyId: id,
      role: body.role || CompanyRole.MEMBER,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error adding company member:", error);
    return NextResponse.json({ error: "Failed to add company member" }, { status: 500 });
  }
}
