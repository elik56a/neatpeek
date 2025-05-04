"use client";

import { useAppDataContext } from "@/providers";
import { Team as CoreTeam } from "@/types";
import { useCallback, useEffect, useState } from "react";

// Extend the core Team type with additional properties needed for this feature
interface Team extends Omit<CoreTeam, "createdAt" | "updatedAt"> {
  createdAt: string; // Override Date with string for API response
  updatedAt: string; // Override Date with string for API response
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
  const { company } = useAppDataContext();
  const companyId = company?.id;
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
