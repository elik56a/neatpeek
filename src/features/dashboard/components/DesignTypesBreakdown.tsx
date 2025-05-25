"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DesignTypeBreakdown } from "../types";
import { formatPercentage } from "../utils/dashboard-utils";

interface DesignTypesBreakdownProps {
  designTypes?: DesignTypeBreakdown[];
  loading: boolean;
}

export const DesignTypesBreakdown = ({ designTypes, loading }: DesignTypesBreakdownProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Design Types</CardTitle>
          <CardDescription>Breakdown by design type</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {designTypes?.map((item, index) => (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="font-medium">{item.type}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.count}</Badge>
                    <div className="text-sm text-muted-foreground">
                      {formatPercentage(item.passRate)}
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
