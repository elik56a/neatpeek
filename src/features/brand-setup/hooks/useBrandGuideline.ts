"use client";

import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";
import { BrandGuideline } from "../types";

/**
 * Hook for fetching and managing a single brand guideline
 */
export function useBrandGuideline(id: string) {
  const [brandGuideline, setBrandGuideline] = useState<BrandGuideline | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch brand guideline
  const fetchBrandGuideline = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/brand-guidelines/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch brand guideline");
      }

      const data = await response.json();
      setBrandGuideline(data);
    } catch (error) {
      console.error("Error fetching brand guideline:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch brand guideline");

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch brand guideline",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  // Start analysis
  const startAnalysis = useCallback(async () => {
    if (!id) return;

    try {
      const response = await fetch(`/api/brand-guidelines/${id}/analyze`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start analysis");
      }

      const data = await response.json();
      setBrandGuideline(data);

      toast({
        title: "Analysis Started",
        description: "The brand guideline analysis has started. This may take a few minutes.",
      });

      return data;
    } catch (error) {
      console.error("Error starting analysis:", error);

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start analysis",
        variant: "destructive",
      });

      throw error;
    }
  }, [id, toast]);

  // Delete brand guideline
  const deleteBrandGuideline = useCallback(async () => {
    if (!id) return;

    try {
      const response = await fetch(`/api/brand-guidelines/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete brand guideline");
      }

      toast({
        title: "Brand Guideline Deleted",
        description: "The brand guideline has been successfully deleted.",
      });

      return true;
    } catch (error) {
      console.error("Error deleting brand guideline:", error);

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete brand guideline",
        variant: "destructive",
      });

      throw error;
    }
  }, [id, toast]);

  // Fetch brand guideline on mount and when ID changes
  useEffect(() => {
    if (id) {
      fetchBrandGuideline();
    }
  }, [id, fetchBrandGuideline]);

  return {
    brandGuideline,
    isLoading,
    error,
    refetch: fetchBrandGuideline,
    startAnalysis,
    deleteBrandGuideline,
  };
}
