"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CompanyDashboard } from "@/features/company";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { status } = useSession();

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="container py-10">
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <CompanyDashboard />
    </div>
  );
}
