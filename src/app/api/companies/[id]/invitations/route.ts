import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server";
import { prisma } from "@/services/db/prisma";
import { invitationService } from "@/features/company/services";
import { CompanyRole } from "@prisma/client";

/**
 * Get all invitations for a company
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract the ID from params
    const { id } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view company invitations" },
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
        { error: "You do not have permission to view invitations for this company" },
        { status: 403 }
      );
    }

    // Get all invitations for the company
    const invitations = await invitationService.getCompanyInvitations(id);

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error getting company invitations:", error);
    return NextResponse.json({ error: "Failed to get company invitations" }, { status: 500 });
  }
}

/**
 * Create a new invitation for a company
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Extract the ID from params
    const { id } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to create invitations" },
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
        { error: "You do not have permission to create invitations for this company" },
        { status: 403 }
      );
    }

    // Get the request body
    const body = await req.json();

    // Validate the request body
    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, companyId: true },
    });

    if (existingUser?.companyId === id) {
      return NextResponse.json(
        { error: "User is already a member of this company" },
        { status: 400 }
      );
    }

    if (existingUser?.companyId) {
      return NextResponse.json(
        { error: "User is already a member of another company" },
        { status: 400 }
      );
    }

    // Create the invitation
    const invitation = await invitationService.createInvitation({
      email: body.email,
      companyId: id,
      role: body.role || CompanyRole.MEMBER,
      createdById: user.id,
      expiresInDays: body.expiresInDays || 7,
    });

    // TODO: Send invitation email

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}
