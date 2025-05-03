import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/services/db/prisma";
import { invitationService } from "@/features/company/services";
import { InvitationStatus } from "@prisma/client";

/**
 * Get an invitation by token
 */
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    // Extract the token from params
    const { token } = await Promise.resolve(params);

    // Get the invitation
    const invitation = await invitationService.getInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check if the invitation has expired
    if (invitation.expires < new Date()) {
      // Update invitation status to expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });

      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    // Check if the invitation has already been used
    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json({ error: "Invitation is no longer valid" }, { status: 400 });
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.error("Error getting invitation:", error);
    return NextResponse.json({ error: "Failed to get invitation" }, { status: 500 });
  }
}

/**
 * Accept an invitation
 */
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    // Extract the token from params
    const { token } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invitation" },
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

    // Check if the user is already in a company
    if (user.companyId) {
      return NextResponse.json({ error: "You are already a member of a company" }, { status: 400 });
    }

    // Get the invitation
    const invitation = await invitationService.getInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check if the invitation is for the current user
    if (invitation.email !== session.user.email) {
      return NextResponse.json({ error: "This invitation is not for you" }, { status: 403 });
    }

    // Accept the invitation
    await invitationService.acceptInvitation({
      token,
      userId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json({ error: "Failed to accept invitation" }, { status: 500 });
  }
}

/**
 * Revoke an invitation
 */
export async function DELETE(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    // Extract the token from params
    const { token } = await Promise.resolve(params);

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to revoke an invitation" },
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

    // Get the invitation
    const invitation = await invitationService.getInvitationByToken(token);

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check if the user is an admin or owner of the company
    if (
      user.companyId !== invitation.companyId ||
      (user.companyRole !== "ADMIN" && user.companyRole !== "OWNER")
    ) {
      return NextResponse.json(
        { error: "You do not have permission to revoke this invitation" },
        { status: 403 }
      );
    }

    // Revoke the invitation
    await invitationService.revokeInvitation(invitation.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking invitation:", error);
    return NextResponse.json({ error: "Failed to revoke invitation" }, { status: 500 });
  }
}
