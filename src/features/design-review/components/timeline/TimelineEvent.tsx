"use client";

import { Badge } from "@/components/ui/badge";
import { ReviewHistoryEntry } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle2, FileSearch, PlusCircle, ThumbsUp } from "lucide-react";
import { getActionBadgeVariant, getActionColor, getActionIcon, getActionLabel } from "../../utils/enum-mappers";

interface TimelineEventProps {
  event: ReviewHistoryEntry;
  isFirst: boolean;
}

/**
 * Component for displaying a timeline event
 */
export function TimelineEvent({ event, isFirst }: TimelineEventProps) {
  // Format the timestamp
  const formattedTime = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });

  // Get the icon for this action
  const Icon = getActionIcon(event.action);

  // Get the color for this action
  const iconColor = getActionColor(event.action);

  // Get the badge variant for this action
  const badgeVariant = getActionBadgeVariant(event.action);

  // Get the action text
  const actionText = getActionLabel(event.action);

  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
          <div className="flex items-center gap-2 mb-1 sm:mb-0">
            <Badge variant={badgeVariant as any}>{actionText}</Badge>
            {isFirst && <Badge variant="outline" className="bg-primary/10">Latest</Badge>}
          </div>
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
        </div>

        <p className="text-sm mb-2">{event.summary}</p>

        {event.changes && (
          <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-2 rounded-md">
            {event.changes.fixed_count > 0 && (
              <div className="flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                <span>{event.changes.fixed_count} issues fixed</span>
              </div>
            )}
            {event.changes.partially_fixed_count > 0 && (
              <div className="flex items-center">
                <ThumbsUp className="h-3 w-3 mr-1 text-amber-500" />
                <span>{event.changes.partially_fixed_count} issues partially fixed</span>
              </div>
            )}
            {event.changes.not_fixed_count > 0 && (
              <div className="flex items-center">
                <AlertCircle className="h-3 w-3 mr-1 text-destructive" />
                <span>{event.changes.not_fixed_count} issues not fixed</span>
              </div>
            )}
            {event.changes.new_issues_count > 0 && (
              <div className="flex items-center">
                <PlusCircle className="h-3 w-3 mr-1 text-destructive" />
                <span>{event.changes.new_issues_count} new issues found</span>
              </div>
            )}
            {event.changes.design_score !== undefined && (
              <div className="flex items-center">
                <FileSearch className="h-3 w-3 mr-1 text-primary" />
                <span>Design score: {event.changes.design_score}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
