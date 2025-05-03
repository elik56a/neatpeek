"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TeamStats {
  memberCount: number;
  brandCount: number;
  recentActivity: {
    id: string;
    type: string;
    title: string;
    date: string;
    user: {
      name: string;
      email: string;
    };
  }[];
}

interface TeamDashboardProps {
  teamId: string;
  isTeamAdmin: boolean;
}

export function TeamDashboard({ teamId, isTeamAdmin }: TeamDashboardProps) {
  const [team, setTeam] = useState<{
    id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch team details
        const teamResponse = await fetch(`/api/teams/${teamId}`);

        if (!teamResponse.ok) {
          const errorData = await teamResponse.json();
          throw new Error(errorData.error || "Failed to fetch team details");
        }

        const teamData = await teamResponse.json();
        setTeam(teamData);

        // Fetch team statistics
        const statsResponse = await fetch(`/api/teams/${teamId}/stats`);

        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(errorData.error || "Failed to fetch team statistics");
        }

        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching team data:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch team data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        <p>Error loading team dashboard: {error}</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        <p>Team not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">{team.description || "Team dashboard"}</p>
        </div>
        {isTeamAdmin && (
          <Button asChild>
            <Link href={`/teams/${teamId}/edit`}>
              <Settings className="mr-2 h-4 w-4" />
              Team Settings
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.memberCount || 0}</div>
            <p className="text-xs text-muted-foreground">People in this team</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href={`/teams/${teamId}?tab=members`}>View Members</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Guidelines</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.brandCount || 0}</div>
            <p className="text-xs text-muted-foreground">Brand guidelines in this team</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href={`/brand-setup?teamId=${teamId}`}>View Brand Guidelines</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Recent actions taken by members of this team</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex-1">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.user.name} ({activity.user.email})
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
