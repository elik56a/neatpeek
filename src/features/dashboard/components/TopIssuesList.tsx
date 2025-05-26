"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IssueCategory, IssueSeverity } from "../types";
import { formatPercentage } from "../utils/dashboard-utils";

interface TopIssuesListProps {
  issues?: IssueCategory[];
  loading: boolean;
}

export const TopIssuesList = ({ issues, loading }: TopIssuesListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Top Issues</CardTitle>
          <CardDescription>Most common brand inconsistencies</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {issues?.slice(0, 5).map((issue, index) => (
                <motion.div
                  key={issue.category}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between hover-scale py-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-muted-foreground font-mono text-sm">
                      {index + 1}.
                    </span>
                    <span className="font-medium">{issue.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        issue.severity === IssueSeverity.HIGH
                          ? "destructive"
                          : issue.severity === IssueSeverity.MEDIUM
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {issue.count}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage(issue.percentage)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
