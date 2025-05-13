/**
 * Utility functions for mapping enums to human-readable labels and UI properties
 */

import { ReviewTimelineAction } from "../types";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileSearch,
  PlusCircle,
  RefreshCw,
  ThumbsUp,
  LucideIcon,
} from "lucide-react";

/**
 * Maps a ReviewTimelineAction to a human-readable label
 * @param action The action to map
 * @returns A human-readable label
 */
export function getActionLabel(action: ReviewTimelineAction): string {
  switch (action) {
    case ReviewTimelineAction.INITIAL_REVIEW:
      return "Initial Review";
    case ReviewTimelineAction.RECHECK:
      return "Recheck";
    case ReviewTimelineAction.NEW_ISSUES_FOUND:
      return "New Issues Found";
    case ReviewTimelineAction.ISSUES_FIXED:
      return "Issues Fixed";
    case ReviewTimelineAction.ISSUES_PARTIALLY_FIXED:
      return "Issues Partially Fixed";
    default:
      return action;
  }
}

/**
 * Maps a ReviewTimelineAction to a badge variant
 * @param action The action to map
 * @returns A badge variant
 */
export function getActionBadgeVariant(action: ReviewTimelineAction): string {
  switch (action) {
    case ReviewTimelineAction.INITIAL_REVIEW:
      return "default";
    case ReviewTimelineAction.RECHECK:
      return "outline";
    case ReviewTimelineAction.NEW_ISSUES_FOUND:
      return "destructive";
    case ReviewTimelineAction.ISSUES_FIXED:
      return "success";
    case ReviewTimelineAction.ISSUES_PARTIALLY_FIXED:
      return "warning";
    default:
      return "secondary";
  }
}

/**
 * Maps a ReviewTimelineAction to an icon
 * @param action The action to map
 * @returns An icon component
 */
export function getActionIcon(action: ReviewTimelineAction): LucideIcon {
  switch (action) {
    case ReviewTimelineAction.INITIAL_REVIEW:
      return FileSearch;
    case ReviewTimelineAction.RECHECK:
      return RefreshCw;
    case ReviewTimelineAction.NEW_ISSUES_FOUND:
      return PlusCircle;
    case ReviewTimelineAction.ISSUES_FIXED:
      return CheckCircle2;
    case ReviewTimelineAction.ISSUES_PARTIALLY_FIXED:
      return ThumbsUp;
    default:
      return Clock;
  }
}

/**
 * Maps a ReviewTimelineAction to a color
 * @param action The action to map
 * @returns A color class
 */
export function getActionColor(action: ReviewTimelineAction): string {
  switch (action) {
    case ReviewTimelineAction.INITIAL_REVIEW:
      return "text-primary";
    case ReviewTimelineAction.RECHECK:
      return "text-amber-500";
    case ReviewTimelineAction.NEW_ISSUES_FOUND:
      return "text-destructive";
    case ReviewTimelineAction.ISSUES_FIXED:
      return "text-green-500";
    case ReviewTimelineAction.ISSUES_PARTIALLY_FIXED:
      return "text-amber-500";
    default:
      return "text-muted-foreground";
  }
}
