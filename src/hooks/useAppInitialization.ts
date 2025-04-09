"use client";

import { useToast } from "@/components/ui/use-toast";
import { useAppDataContext } from "@/providers";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

/**
 * Hook for initializing app data when the app loads and user is authenticated
 * This centralizes data fetching that's needed across the app
 */
export function useAppInitialization() {
  const { data: session, status } = useSession();
  const { refetchCompany } = useAppDataContext();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Initialize app data when session is available
  useEffect(() => {
    const initializeApp = async () => {
      // Skip if not authenticated or already initialized
      if (status !== "authenticated" || isInitialized) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log("Initializing app data...");
        
        // 1. Fetch user's company data
        await refetchCompany();
        
        // 2. Add other initialization tasks here as needed
        // For example:
        // - Fetch user preferences
        // - Fetch notifications
        // - Fetch global app settings
        // - Initialize analytics
        
        console.log("App initialization complete");
        setIsInitialized(true);
      } catch (error) {
        console.error("Error during app initialization:", error);
        setError(error instanceof Error ? error : new Error("Failed to initialize app"));
        
        toast({
          title: "Initialization Error",
          description: "There was a problem loading your data. Some features may not work correctly.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [status, isInitialized, refetchCompany, toast]);

  return {
    isInitialized,
    isLoading,
    error,
    // Add a manual refresh function
    refreshAppData: async () => {
      setIsInitialized(false); // This will trigger the useEffect to run again
    }
  };
}
