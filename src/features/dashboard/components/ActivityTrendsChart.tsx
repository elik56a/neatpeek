"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  LineChart as LineChartIcon,
  LayoutDashboard,
  PieChart as PieChartIcon,
} from "lucide-react";
import { ActivityTrend, DatePeriod } from "../types";
import {
  formatPercentage,
  formatNumber,
  getChartColors,
  getPeriodDisplayName,
} from "../utils/dashboard-utils";

interface ActivityTrendsChartProps {
  activityTrends?: ActivityTrend[];
  deviceBreakdown?: Array<{ device: string; percentage: number }>;
  designBreakdown?: Array<{ type: string; count: number }>;
  selectedPeriod: DatePeriod;
  loading: boolean;
}

export const ActivityTrendsChart = ({
  activityTrends,
  deviceBreakdown,
  designBreakdown,
  selectedPeriod,
  loading,
}: ActivityTrendsChartProps) => {
  const [chartType, setChartType] = useState<"line" | "area" | "bar" | "pie">("line");
  const colors = getChartColors();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="md:col-span-2 lg:col-span-5"
    >
      <Card className="h-[480px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Trends</CardTitle>
              <CardDescription>
                Design review activity over {getPeriodDisplayName(selectedPeriod).toLowerCase()}
              </CardDescription>
            </div>
            <Tabs
              value={chartType}
              onValueChange={v => setChartType(v as "line" | "area" | "bar" | "pie")}
              className="w-fit"
            >
              <TabsList className="grid grid-cols-4 w-fit h-8">
                <TabsTrigger value="line" className="px-2">
                  <LineChartIcon className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="area" className="px-2">
                  <LayoutDashboard className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="bar" className="px-2">
                  <BarChart3 className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="pie" className="px-2">
                  <PieChartIcon className="h-3 w-3" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="pl-2 flex-1 flex items-center">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="space-y-3 w-full">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ) : (
            <div className="w-full h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={chartType}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {chartType === "line" && (
                    <LineChart
                      data={activityTrends || []}
                      index="date"
                      categories={["reviews", "passRate", "consistencyScore"]}
                      colors={[colors.primary, colors.success, colors.info]}
                      showLegend={true}
                      showGridLines={true}
                      showAnimation={true}
                      className="h-full"
                      valueFormatter={value =>
                        typeof value === "number" && value <= 100
                          ? formatPercentage(value)
                          : formatNumber(value)
                      }
                    />
                  )}
                  {chartType === "area" && (
                    <AreaChart
                      data={activityTrends || []}
                      index="date"
                      categories={["reviews", "passRate", "consistencyScore"]}
                      colors={[colors.primary, colors.success, colors.info]}
                      showLegend={true}
                      showGridLines={true}
                      showAnimation={true}
                      className="h-full"
                      valueFormatter={value =>
                        typeof value === "number" && value <= 100
                          ? formatPercentage(value)
                          : formatNumber(value)
                      }
                    />
                  )}
                  {chartType === "bar" && (
                    <BarChart
                      data={designBreakdown || []}
                      index="type"
                      categories={["count"]}
                      colors={[colors.primary]}
                      showLegend={false}
                      showGridLines={true}
                      showAnimation={true}
                      className="h-full"
                      valueFormatter={formatNumber}
                    />
                  )}
                  {chartType === "pie" && (
                    <PieChart
                      data={
                        deviceBreakdown?.map(item => ({
                          name: item.device,
                          value: item.percentage,
                        })) || []
                      }
                      index="name"
                      category="value"
                      colors={[colors.primary, colors.secondary, colors.info]}
                      showAnimation={true}
                      className="h-full"
                      valueFormatter={formatPercentage}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
