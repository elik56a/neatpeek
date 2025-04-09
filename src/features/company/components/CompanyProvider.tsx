"use client";

import { CompanyRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

interface Company {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  settings?: any;
}

interface CompanyContextType {
  company: Company | null;
  companyId: string | null;
  companyRole: CompanyRole | null;
  isCompanyOwner: boolean;
  isCompanyAdmin: boolean;
  isCompanyMember: boolean;
  hasCompany: boolean;
  isLoading: boolean;
  error: Error | null;
  refetchCompany: () => Promise<void>;
  refreshSession?: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update: updateSession } = useSession();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to refresh the session
  // Disable session refresh to prevent infinite loops
  const refreshSession = async () => {
    console.log("Session refresh disabled to prevent infinite loops");
    // Do nothing - this is intentionally disabled to prevent infinite loops
    return;
  };

  const companyId = session?.user?.companyId || null;
  const companyRole = session?.user?.companyRole || null;

  const isCompanyOwner = companyRole === CompanyRole.OWNER;
  const isCompanyAdmin = companyRole === CompanyRole.ADMIN || isCompanyOwner;
  const isCompanyMember = !!companyId;
  const hasCompany = !!companyId;

  const fetchCompany = async () => {
    // Use a local variable to track if the component is still mounted
    let isMounted = true;

    if (!companyId) {
      setCompany(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/companies/${companyId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch company details');
      }

      const data = await response.json();
      if (isMounted) setCompany(data);
    } catch (error) {
      console.error('Error fetching company details:', error);
      if (isMounted) setError(error instanceof Error ? error : new Error('Failed to fetch company details'));
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };

  // Fetch company details when companyId changes
  useEffect(() => {
    let isMounted = true;

    const getCompanyDetails = async () => {
      // Skip if we don't have a company ID
      if (!companyId) {
        if (isMounted) setCompany(null);
        return;
      }

      if (isMounted) setIsLoading(true);
      if (isMounted) setError(null);

      try {
        const response = await fetch(`/api/companies/${companyId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch company details');
        }

        const data = await response.json();
        if (isMounted) setCompany(data);
      } catch (error) {
        console.error('Error fetching company details:', error);
        if (isMounted) setError(error instanceof Error ? error : new Error('Failed to fetch company details'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    getCompanyDetails();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  // Disable initial session refresh to prevent infinite loops
  useEffect(() => {
    console.log("Initial session refresh disabled to prevent infinite loops");
    // Do nothing - this is intentionally disabled to prevent infinite loops
  }, []);

  return (
    <CompanyContext.Provider
      value={{
        company,
        companyId,
        companyRole,
        isCompanyOwner,
        isCompanyAdmin,
        isCompanyMember,
        hasCompany,
        isLoading,
        error,
        refetchCompany: fetchCompany,
        refreshSession,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompanyContext() {
  const context = useContext(CompanyContext);

  if (context === undefined) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }

  return context;
}
