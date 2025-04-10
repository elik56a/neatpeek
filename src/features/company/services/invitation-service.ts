import { prisma } from '@/services/db/prisma';
import { CompanyRole, Invitation, InvitationStatus } from '@prisma/client';
import { addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing company invitations
 */
export class InvitationService {
  /**
   * Create a new invitation
   */
  async createInvitation(params: {
    email: string;
    companyId: string;
    role?: CompanyRole;
    createdById?: string;
    expiresInDays?: number;
  }): Promise<Invitation> {
    const {
      email,
      companyId,
      role = CompanyRole.MEMBER,
      createdById,
      expiresInDays = 7,
    } = params;

    // Generate a unique token
    const token = uuidv4();

    // Set expiration date
    const expires = addDays(new Date(), expiresInDays);

    return prisma.invitation.create({
      data: {
        email,
        companyId,
        role,
        token,
        expires,
        createdById,
        status: InvitationStatus.PENDING,
      },
    });
  }

  /**
   * Get an invitation by token
   */
  async getInvitationByToken(token: string): Promise<Invitation | null> {
    return prisma.invitation.findUnique({
      where: { token },
      include: {
        company: true,
      },
    });
  }

  /**
   * Get invitations for a company
   */
  async getCompanyInvitations(companyId: string): Promise<Invitation[]> {
    return prisma.invitation.findMany({
      where: {
        companyId,
        status: InvitationStatus.PENDING,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(params: {
    token: string;
    userId: string;
  }): Promise<Invitation> {
    const { token, userId } = params;

    // Get the invitation
    const invitation = await this.getInvitationByToken(token);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error('Invitation is no longer valid');
    }

    if (invitation.expires < new Date()) {
      // Update invitation status to expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new Error('Invitation has expired');
    }

    // Update the user to join the company
    await prisma.user.update({
      where: { id: userId },
      data: {
        companyId: invitation.companyId,
        companyRole: invitation.role,
      },
    });

    // Update invitation status to accepted
    return prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED },
    });
  }

  /**
   * Revoke an invitation
   */
  async revokeInvitation(id: string): Promise<Invitation> {
    return prisma.invitation.update({
      where: { id },
      data: { status: InvitationStatus.REVOKED },
    });
  }

  /**
   * Clean up expired invitations
   */
  async cleanupExpiredInvitations(): Promise<number> {
    const result = await prisma.invitation.updateMany({
      where: {
        expires: { lt: new Date() },
        status: InvitationStatus.PENDING,
      },
      data: {
        status: InvitationStatus.EXPIRED,
      },
    });

    return result.count;
  }
}

// Export a singleton instance
export const invitationService = new InvitationService();
