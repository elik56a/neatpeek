"use client";

import { CompanyRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useCallback } from "react";

interface Company {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
}

interface UseCompanyResult {
  company: {
    id?: string;
    name?: string;
  } | null;
  companyId: string | null;
  companyRole: CompanyRole | null;
  isCompanyOwner: boolean;
  isCompanyAdmin: boolean;
  isCompanyMember: boolean;
  hasCompany: boolean;
  fetchCompanyDetails: () => Promise<Company | null>;
}

/**
 * Hook for accessing company information
 */
export function useCompany(): UseCompanyResult {
  const { data: session } = useSession();
  
  const companyId = session?.user?.companyId || null;
  const companyRole = session?.user?.companyRole || null;
  const companyName = session?.user?.companyName || null;
  
  const isCompanyOwner = companyRole === CompanyRole.OWNER;
  const isCompanyAdmin = companyRole === CompanyRole.ADMIN || isCompanyOwner;
  const isCompanyMember = !!companyId;
  const hasCompany = !!companyId;
  
  const company = companyId && companyName ? { id: companyId, name: companyName } : null;
  
  /**
   * Fetch detailed company information
   */
  const fetchCompanyDetails = useCallback(async (): Promise<Company | null> => {
    if (!companyId) return null;
    
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch company details');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching company details:', error);
      return null;
    }
  }, [companyId]);
  
  return {
    company,
    companyId,
    companyRole,
    isCompanyOwner,
    isCompanyAdmin,
    isCompanyMember,
    hasCompany,
    fetchCompanyDetails,
  };
}
