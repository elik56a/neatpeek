"use client";

import { useCompanyContext } from "@/features/company/components/CompanyProvider";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";
import { BrandGuideline } from "../types";

/**
 * Hook for fetching and managing brand guidelines
 */
export function useBrandGuidelines() {
  const [brandGuidelines, setBrandGuidelines] = useState<BrandGuideline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get company context
  const { companyId } = useCompanyContext();

  // Fetch brand guidelines
  const fetchBrandGuidelines = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Add company filter if available
      const url = companyId
        ? `/api/brand-guidelines?companyId=${companyId}`
        : '/api/brand-guidelines';

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch brand guidelines');
      }

      const data = await response.json();
      setBrandGuidelines(data);
    } catch (error) {
      console.error('Error fetching brand guidelines:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch brand guidelines');

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch brand guidelines',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, companyId]);

  // Delete a brand guideline
  const deleteBrandGuideline = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/brand-guidelines/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete brand guideline');
      }

      // Remove the deleted brand guideline from the state
      setBrandGuidelines((prev) => prev.filter((bg) => bg.id !== id));

      toast({
        title: 'Success',
        description: 'Brand guideline deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting brand guideline:', error);

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete brand guideline',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Fetch brand guidelines on mount
  useEffect(() => {
    fetchBrandGuidelines();
  }, [fetchBrandGuidelines]);

  return {
    brandGuidelines,
    isLoading,
    error,
    refetch: fetchBrandGuidelines,
    deleteBrandGuideline,
  };
}
