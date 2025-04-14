"use client";

import { useAppData } from "@/hooks/useAppData";
import { Company, User } from "@/types";
import { createContext, useContext } from "react";

// Import the Brand type if it's defined elsewhere
interface Brand {
  id: string;
  name: string;
  description?: string;
  brandRules?: any;
}

interface AppDataContextType {
  user: User | null;
  company: Company | null;
  companyId: string | null;
  brands: Brand[];
  hasCompany: boolean;
  isCompanyOwner: boolean;
  isCompanyAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
}

// Create context
const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

/**
 * AppDataProvider
 *
 * A central provider for app data including user and company information.
 * This provider uses the useAppData hook to fetch data once when the app loads.
 */
export function AppDataProvider({ children }: { children: React.ReactNode }) {
  // Use the hook to fetch and manage app data
  const appData = useAppData();

  return (
    <AppDataContext.Provider value={appData}>
      {children}
    </AppDataContext.Provider>
  );
}

/**
 * Hook to use app data
 */
export function useAppDataContext() {
  const context = useContext(AppDataContext);

  if (context === undefined) {
    throw new Error('useAppDataContext must be used within an AppDataProvider');
  }

  return context;
}
