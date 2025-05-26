"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "../hooks/useDashboard";
import { DatePeriod } from "../types";
import { DashboardHeader } from "./DashboardHeader";
import { MetricsCards } from "./MetricsCards";
import { ActivityTrendsChart } from "./ActivityTrendsChart";
import { RecentActivityList } from "./RecentActivityList";
import { DesignTypesBreakdown } from "./DesignTypesBreakdown";
import { TopIssuesList } from "./TopIssuesList";
import { PerformanceInsights } from "./PerformanceInsights";

export const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>(DatePeriod.THIRTY_DAYS);

  const { data, loading, error, updateFilters, retry } = useDashboard({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      period: selectedPeriod,
    },
  });

  // Handle period change
  const handlePeriodChange = (period: DatePeriod) => {
    setSelectedPeriod(period);
    const periodDays = {
      [DatePeriod.SEVEN_DAYS]: 7,
      [DatePeriod.THIRTY_DAYS]: 30,
      [DatePeriod.NINETY_DAYS]: 90,
      [DatePeriod.ONE_YEAR]: 365,
    };

    const days = periodDays[period];
    updateFilters({
      dateRange: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        period,
      },
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
        <Button onClick={retry} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />

      <MetricsCards metrics={data?.metrics} loading={loading} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <ActivityTrendsChart
          activityTrends={data?.activityTrends}
          deviceBreakdown={data?.designBreakdown.byDevice}
          designBreakdown={data?.designBreakdown.byType}
          selectedPeriod={selectedPeriod}
          loading={loading}
        />

        <RecentActivityList activities={data?.recentActivity} loading={loading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DesignTypesBreakdown designTypes={data?.designBreakdown.byType} loading={loading} />

        <TopIssuesList issues={data?.issueAnalysis.topIssues} loading={loading} />

        <PerformanceInsights insights={data?.performanceInsights} loading={loading} />
      </div>
    </div>
  );
};
