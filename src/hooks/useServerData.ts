"use client";

import { useState, useEffect } from "react";
import * as dbActions from "@/lib/db/actions";

// Generic hook for fetching data from server actions
export function useServerData<T>(
  actionFn: () => Promise<T>,
  initialData: T,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await actionFn();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, isLoading, error };
}

// Specific hooks for common data needs
export function useCurrentUser() {
  return useServerData(dbActions.getCurrentUser, null);
}

export function useBrandGuidelines() {
  return useServerData(dbActions.getBrandGuidelines, []);
}

export function useBrandGuideline(id: string) {
  return useServerData(() => dbActions.getBrandGuidelineById(id), null, [id]);
}

export function useDesignReviews() {
  return useServerData(dbActions.getDesignReviews, []);
}

export function useDesignReview(id: string) {
  return useServerData(() => dbActions.getDesignReviewById(id), null, [id]);
}

// Add more specific hooks as needed
