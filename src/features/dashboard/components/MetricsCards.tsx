"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Target, Sliders, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { DashboardMetrics } from "../types";
import { formatPercentage, formatNumber, formatGrowth } from "../utils/dashboard-utils";

interface MetricsCardsProps {
  metrics?: DashboardMetrics;
  loading: boolean;
}

export const MetricsCards = ({ metrics, loading }: MetricsCardsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))
      ) : (
        <>
          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Design Reviews</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics?.totalReviews || 0)}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                {metrics?.monthlyGrowth.totalReviews !== undefined && (
                  <>
                    {metrics.monthlyGrowth.totalReviews >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    {formatGrowth(metrics.monthlyGrowth.totalReviews)} from last period
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passing Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(metrics?.passingRate || 0)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                {metrics?.monthlyGrowth.passingRate !== undefined && (
                  <>
                    {metrics.monthlyGrowth.passingRate >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    {formatGrowth(metrics.monthlyGrowth.passingRate)} from last period
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Brand Consistency</CardTitle>
              <Sliders className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(metrics?.brandConsistencyScore || 0)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                {metrics?.monthlyGrowth.brandConsistencyScore !== undefined && (
                  <>
                    {metrics.monthlyGrowth.brandConsistencyScore >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    {formatGrowth(metrics.monthlyGrowth.brandConsistencyScore)} from last period
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Reviews</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeReviews || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metrics?.totalBrandGuidelines || 0} brand guidelines
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
};
