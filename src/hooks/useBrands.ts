"use client";

import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";

// Define the Brand type
interface Brand {
  id: string;
  name: string;
  description?: string;
  brandRules?: any;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hook for fetching and managing brands
 */
export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Fetch all brands the user has access to
   */
  const fetchBrands = useCallback(async () => {
    console.log("Fetching brands...");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/brands", {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const data = await response.json();
      console.log("Brands fetched:", data.length);
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setError(error instanceof Error ? error : new Error("Failed to fetch brands"));

      toast({
        title: "Error",
        description: "Failed to load brands. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch brands on mount
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    isLoading,
    error,
    refreshBrands: fetchBrands,
  };
}
