"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDataContext } from "@/providers";
import { Building, FileText, Plus, Settings, Users } from "lucide-react";
import Link from "next/link";

import { User } from "@/types";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  date: string;
  user: Pick<User, 'name' | 'email'>;
}

interface CompanyStats {
  memberCount: number;
  teamCount: number;
  brandCount: number;
  recentActivity: ActivityItem[];
}

export function CompanyDashboard() {
  const { company, hasCompany, isCompanyAdmin, isLoading } = useAppDataContext();

  // No company state
  if (!isLoading && !hasCompany) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Building className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium">No Company</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          You are not a member of any company. Create a company to get started.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/company/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Company
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Mock data for the dashboard
  const stats: CompanyStats = {
    memberCount: 3,
    teamCount: 2,
    brandCount: 1,
    recentActivity: [
      {
        id: '1',
        type: 'brand_created',
        title: 'New brand guideline created',
        date: new Date().toISOString(),
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    ],
  };

  // Dashboard state
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company?.name || "Company Dashboard"}</h1>
          <p className="text-muted-foreground">
            Overview of your company's resources and activities
          </p>
        </div>
        {isCompanyAdmin && (
          <Button asChild>
            <Link href="/company/settings">
              <Settings className="mr-2 h-4 w-4" />
              Company Settings
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.memberCount}</div>
            <p className="text-xs text-muted-foreground">
              People in your company
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/company/members">View Members</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamCount}</div>
            <p className="text-xs text-muted-foreground">
              Teams in your company
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/teams">View Teams</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Guidelines</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.brandCount}</div>
            <p className="text-xs text-muted-foreground">
              Brand guidelines in your company
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/brand-setup">View Brand Guidelines</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Recent actions taken by members of your company
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
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
