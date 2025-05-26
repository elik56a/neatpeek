import { useState, useEffect, useCallback } from "react";
import { DashboardData, DashboardFilters, DatePeriod, DashboardResponse } from "../types";

/**
 * Main dashboard hook with comprehensive filtering and state management
 */
export function useDashboard(initialFilters?: DashboardFilters) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters | undefined>(initialFilters);

  const fetchDashboardData = useCallback(async (currentFilters?: DashboardFilters) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();

      if (currentFilters?.dateRange) {
        searchParams.set("period", currentFilters.dateRange.period);
        searchParams.set("start", currentFilters.dateRange.start);
        searchParams.set("end", currentFilters.dateRange.end);
      }

      if (currentFilters?.designTypes?.length) {
        searchParams.set("designTypes", currentFilters.designTypes.join(","));
      }

      if (currentFilters?.projects?.length) {
        searchParams.set("projects", currentFilters.projects.join(","));
      }

      if (currentFilters?.brandGuidelines?.length) {
        searchParams.set("brandGuidelines", currentFilters.brandGuidelines.join(","));
      }

      const url = `/api/dashboard?${searchParams.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: DashboardResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }

      setData(result.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters and refresh data
  const updateFilters = useCallback(
    (newFilters: DashboardFilters) => {
      setFilters(newFilters);
      fetchDashboardData(newFilters);
    },
    [fetchDashboardData]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(undefined);
    fetchDashboardData(undefined);
  }, [fetchDashboardData]);

  // Retry loading data
  const retry = useCallback(() => {
    fetchDashboardData(filters);
  }, [fetchDashboardData, filters]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData(filters);
  }, [fetchDashboardData, filters]);

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    retry,
  };
}

/**
 * Simplified dashboard hook for period-based filtering
 */
export function useDashboardByPeriod(period: DatePeriod = DatePeriod.THIRTY_DAYS) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (currentPeriod: DatePeriod) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard?period=${currentPeriod}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: DashboardResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }

      setData(result.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [fetchData, period]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(period),
  };
}
