"use client";

import { useCompanyContext } from "@/features/company/components/CompanyProvider";
import { useCallback, useEffect, useState } from "react";

interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
  };
}

interface UseTeamsResult {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  refetchTeams: () => Promise<void>;
}

export function useTeams(): UseTeamsResult {
  const { companyId } = useCompanyContext();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    if (!companyId) {
      setTeams([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/companies/${companyId}/teams`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch teams");
      }

      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch teams");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    isLoading,
    error,
    refetchTeams: fetchTeams,
  };
}
