"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Activity,
  ArrowRight,
  FileText,
} from "lucide-react";
import { RecentActivity, ActivityType, DashboardStatus } from "../types";
import {
  getStatusVariant,
  formatRelativeTime,
  getActivityTypeLabel,
} from "../utils/dashboard-utils";

interface RecentActivityListProps {
  activities?: RecentActivity[];
  loading: boolean;
}

const getStatusIcon = (status: DashboardStatus) => {
  switch (status) {
    case DashboardStatus.PASSED:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case DashboardStatus.FAILED:
      return <XCircle className="h-4 w-4 text-red-500" />;
    case DashboardStatus.PROCESSING:
      return <Clock className="h-4 w-4 text-blue-500" />;
    case DashboardStatus.PENDING:
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};

export const RecentActivityList = ({ activities, loading }: RecentActivityListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="md:col-span-2 lg:col-span-3"
    >
      <Card className="h-[480px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest design reviews and brand updates</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-full pr-2">
              {activities && activities.length > 0 ? (
                activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="rounded-full p-1.5 mt-0.5 bg-muted">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{activity.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {getActivityTypeLabel(activity.type)}
                        </div>
                        <Badge variant={getStatusVariant(activity.status)} className="text-xs">
                          {activity.status}
                        </Badge>
                      </div>
                      {activity.issueCount && activity.issueCount > 0 && (
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          {activity.issueCount} issue{activity.issueCount > 1 ? "s" : ""} found
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-shrink-0">
          <Button variant="outline" className="w-full">
            View All Activity
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
