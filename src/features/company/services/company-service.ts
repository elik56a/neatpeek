import { prisma } from '@/services/db/prisma';
import { Company, CompanyRole, User } from '@prisma/client';

/**
 * Service for managing companies
 */
export class CompanyService {
  /**
   * Create a new company
   */
  async createCompany(params: {
    name: string;
    domain?: string;
    logo?: string;
    ownerId: string;
  }): Promise<Company> {
    const { name, domain, logo, ownerId } = params;

    // Create the company - handle empty domain to avoid unique constraint issues
    const company = await prisma.company.create({
      data: {
        name,
        domain: domain && domain.trim() !== '' ? domain : null,
        logo: logo && logo.trim() !== '' ? logo : null,
        isActive: true,
      },
    });

    // Update the user to be the company owner
    await prisma.user.update({
      where: { id: ownerId },
      data: {
        companyId: company.id,
        companyRole: CompanyRole.OWNER,
      },
    });

    return company;
  }

  /**
   * Get a company by ID
   */
  async getCompany(id: string): Promise<Company | null> {
    return prisma.company.findUnique({
      where: { id },
    });
  }

  /**
   * Get a company by domain
   */
  async getCompanyByDomain(domain: string): Promise<Company | null> {
    return prisma.company.findUnique({
      where: { domain },
    });
  }

  /**
   * Update a company
   */
  async updateCompany(params: {
    id: string;
    name?: string;
    domain?: string;
    logo?: string;
    isActive?: boolean;
    settings?: any;
  }): Promise<Company> {
    const { id, ...data } = params;

    // Handle empty domain and logo values
    if (data.domain !== undefined) {
      data.domain = data.domain && data.domain.trim() !== '' ? data.domain : null;
    }

    if (data.logo !== undefined) {
      data.logo = data.logo && data.logo.trim() !== '' ? data.logo : null;
    }

    return prisma.company.update({
      where: { id },
      data,
    });
  }

  /**
   * Get company members
   */
  async getCompanyMembers(companyId: string): Promise<User[]> {
    return prisma.user.findMany({
      where: { companyId },
    });
  }

  /**
   * Add a user to a company
   */
  async addUserToCompany(params: {
    userId: string;
    companyId: string;
    role?: CompanyRole;
  }): Promise<User> {
    const { userId, companyId, role = CompanyRole.MEMBER } = params;

    return prisma.user.update({
      where: { id: userId },
      data: {
        companyId,
        companyRole: role,
      },
    });
  }

  /**
   * Remove a user from a company
   */
  async removeUserFromCompany(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        companyId: null,
        companyRole: CompanyRole.MEMBER, // Reset to default
      },
    });
  }

  /**
   * Update a user's role in a company
   */
  async updateUserRole(params: {
    userId: string;
    companyId: string;
    role: CompanyRole;
  }): Promise<User> {
    const { userId, companyId, role } = params;

    return prisma.user.update({
      where: {
        id: userId,
        companyId, // Ensure the user belongs to this company
      },
      data: {
        companyRole: role,
      },
    });
  }
}

// Export a singleton instance
export const companyService = new CompanyService();
