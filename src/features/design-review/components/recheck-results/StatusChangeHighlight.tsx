"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { IssueStatus } from "../../types";
import { cn } from "@/utils/cn";
import { getStatusBadgeVariant, getStatusIcon, getStatusLabel } from "../../utils/enum-mappers";

interface StatusChangeHighlightProps {
  status: IssueStatus;
  previousStatus?: IssueStatus;
  showAnimation?: boolean;
}

/**
 * Component for displaying a status change with animation
 */
export function StatusChangeHighlight({
  status,
  previousStatus,
  showAnimation = true
}: StatusChangeHighlightProps) {
  const [animate, setAnimate] = useState(showAnimation);

  // Reset animation after it plays
  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 2000); // Animation duration

      return () => clearTimeout(timer);
    }
  }, [animate]);

  // Determine if this is a status change
  const isStatusChange = previousStatus && previousStatus !== status;

  // Get the icon component
  const StatusIcon = getStatusIcon(status);

  return (
    <Badge
      variant={getStatusBadgeVariant(status) as any}
      className={cn(
        "flex items-center",
        animate && isStatusChange && "animate-pulse"
      )}
    >
      <StatusIcon className="h-3 w-3 mr-1" />
      <span>{getStatusLabel(status)}</span>

      {isStatusChange && (
        <span className="ml-1 text-xs opacity-70">
          (was {getStatusLabel(previousStatus)})
        </span>
      )}
    </Badge>
  );
}
