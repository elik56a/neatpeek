"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PerformanceInsights as PerformanceInsightsType, ImpactLevel } from "../types";
import { formatPercentage } from "../utils/dashboard-utils";

interface PerformanceInsightsProps {
  insights?: PerformanceInsightsType;
  loading: boolean;
}

export const PerformanceInsights = ({ insights, loading }: PerformanceInsightsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Your design review progress</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium">Personal Best</div>
                <div className="text-lg font-bold text-green-600">
                  {formatPercentage(insights?.personalBest.highestConsistencyScore || 0)}
                </div>
                <div className="text-xs text-muted-foreground">Highest consistency score</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">This Week vs Last Week</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="font-medium">Reviews</div>
                    <div className="flex items-center gap-1">
                      <span>{insights?.weeklyProgress.thisWeek.reviews || 0}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span>{insights?.weeklyProgress.lastWeek.reviews || 0}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Pass Rate</div>
                    <div className="flex items-center gap-1">
                      <span>
                        {formatPercentage(insights?.weeklyProgress.thisWeek.passRate || 0)}
                      </span>
                      <span className="text-muted-foreground">vs</span>
                      <span>
                        {formatPercentage(insights?.weeklyProgress.lastWeek.passRate || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {insights?.improvementAreas.slice(0, 2).map((area, index) => (
                <div key={area.category} className="p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={area.impact === ImpactLevel.HIGH ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {area.impact}
                    </Badge>
                    <span className="text-sm font-medium">{area.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{area.suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
