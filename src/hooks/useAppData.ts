"use client";

import { Company, User } from "@/types";
import { CompanyRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

/**
 * Hook for fetching and managing app data
 *
 * This hook fetches the user profile (including company) when authenticated
 * and provides it to the app. It only fetches the data once when the app loads.
 */
export function useAppData() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const initializationRef = useRef<boolean>(false);

  // Derived state
  const hasCompany = !!company;
  const isCompanyOwner = company ? user?.companyRole === CompanyRole.OWNER : false;
  const isCompanyAdmin = company ? (user?.companyRole === CompanyRole.ADMIN || isCompanyOwner) : false;

  /**
   * Fetch user data including company information
   */
  const fetchUserData = async () => {
    console.log('Fetching user data...');
    setIsLoading(true);
    setError(null);

    try {
      // Fetch user data with company information
      const response = await fetch('/api/users/me', {
        // Add cache control headers to prevent browser caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      console.log('User data fetched:', userData);

      // Set user data
      setUser(userData);

      // If user has company data, set it
      if (userData.company) {
        console.log('User has company:', userData.company.name);
        setCompany(userData.company);
      } else {
        // User has no company
        console.log('User has no company');
        setCompany(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch user data'));
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize app data when session is available
  useEffect(() => {
    const initializeData = async () => {
      // Skip if not authenticated or already initialized
      if (status !== "authenticated" || initializationRef.current) return;

      console.log('Initializing app data...');

      // Set initialization flag immediately to prevent multiple fetches
      initializationRef.current = true;

      try {
        await fetchUserData();
        console.log('App data initialization complete');
      } catch (error) {
        console.error('Error during app data initialization:', error);
      }
    };

    initializeData();

    // Reset initialization flag when session changes
    return () => {
      if (status !== "authenticated") {
        initializationRef.current = false;
      }
    };
  }, [status]);

  // Function to manually refresh data
  const refreshData = async () => {
    if (status !== "authenticated") return;
    await fetchUserData();
  };

  return {
    user,
    company,
    hasCompany,
    isCompanyOwner,
    isCompanyAdmin,
    isLoading,
    error,
    refreshData,
  };
}
