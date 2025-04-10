"use client";

import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";

// Define the BrandGuideline type
export interface BrandRule {
  id: string;
  category: string;
  name: string;
  value: string;
  description: string;
  confidence: number;
  source: string;
}

export interface CustomRule {
  id: string;
  category: string;
  name: string;
  description: string;
}

export interface DesignImage {
  id: string;
  url: string;
  name?: string;
  description?: string;
}

export interface BrandGuideline {
  id: string;
  name: string;
  description?: string;
  status: string;
  pdfUrl?: string;
  processingStatus: string;
  createdAt: string;
  updatedAt: string;
  companyId?: string;
  teamId?: string;
  brandRules: BrandRule[];
  customRules: CustomRule[];
  designImages: DesignImage[];
}

interface UseBrandGuidelinesOptions {
  companyId?: string;
  teamId?: string;
}

/**
 * Hook for fetching and managing brand guidelines
 */
export function useBrandGuidelines(options: UseBrandGuidelinesOptions = {}) {
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  /**
   * Fetch all brand guidelines the user has access to
   */
  const fetchGuidelines = useCallback(async () => {
    console.log('Fetching brand guidelines...');
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (options.companyId) params.append('companyId', options.companyId);
      if (options.teamId) params.append('teamId', options.teamId);
      
      const queryString = params.toString();
      const url = `/api/brand-guidelines${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brand guidelines');
      }

      const data = await response.json();
      console.log('Brand guidelines fetched:', data.length);
      setGuidelines(data);
    } catch (error) {
      console.error('Error fetching brand guidelines:', error);
      setError(error instanceof Error ? error : new Error('Failed to fetch brand guidelines'));
      
      toast({
        title: "Error",
        description: "Failed to load brand guidelines. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [options.companyId, options.teamId, toast]);

  // Fetch guidelines on mount and when dependencies change
  useEffect(() => {
    fetchGuidelines();
  }, [fetchGuidelines]);

  return {
    guidelines,
    isLoading,
    error,
    refreshGuidelines: fetchGuidelines
  };
}
