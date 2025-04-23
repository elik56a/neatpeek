/**
 * Utility functions for mapping enums to human-readable labels and UI properties
 */

import { ReviewHistoryAction } from "../types";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileSearch,
  PlusCircle,
  RefreshCw,
  ThumbsUp,
  LucideIcon
} from "lucide-react";

/**
 * Maps a ReviewHistoryAction to a human-readable label
 * @param action The action to map
 * @returns A human-readable label
 */
export function getActionLabel(action: ReviewHistoryAction): string {
  switch (action) {
    case ReviewHistoryAction.INITIAL_REVIEW:
      return "Initial Review";
    case ReviewHistoryAction.RECHECK:
      return "Recheck";
    case ReviewHistoryAction.NEW_ISSUES_FOUND:
      return "New Issues Found";
    case ReviewHistoryAction.ISSUES_FIXED:
      return "Issues Fixed";
    case ReviewHistoryAction.ISSUES_PARTIALLY_FIXED:
      return "Issues Partially Fixed";
    default:
      return action;
  }
}

/**
 * Maps a ReviewHistoryAction to a badge variant
 * @param action The action to map
 * @returns A badge variant
 */
export function getActionBadgeVariant(action: ReviewHistoryAction): string {
  switch (action) {
    case ReviewHistoryAction.INITIAL_REVIEW:
      return "default";
    case ReviewHistoryAction.RECHECK:
      return "outline";
    case ReviewHistoryAction.NEW_ISSUES_FOUND:
      return "destructive";
    case ReviewHistoryAction.ISSUES_FIXED:
      return "success";
    case ReviewHistoryAction.ISSUES_PARTIALLY_FIXED:
      return "warning";
    default:
      return "secondary";
  }
}

/**
 * Maps a ReviewHistoryAction to an icon
 * @param action The action to map
 * @returns An icon component
 */
export function getActionIcon(action: ReviewHistoryAction): LucideIcon {
  switch (action) {
    case ReviewHistoryAction.INITIAL_REVIEW:
      return FileSearch;
    case ReviewHistoryAction.RECHECK:
      return RefreshCw;
    case ReviewHistoryAction.NEW_ISSUES_FOUND:
      return PlusCircle;
    case ReviewHistoryAction.ISSUES_FIXED:
      return CheckCircle2;
    case ReviewHistoryAction.ISSUES_PARTIALLY_FIXED:
      return ThumbsUp;
    default:
      return Clock;
  }
}

/**
 * Maps a ReviewHistoryAction to a color
 * @param action The action to map
 * @returns A color class
 */
export function getActionColor(action: ReviewHistoryAction): string {
  switch (action) {
    case ReviewHistoryAction.INITIAL_REVIEW:
      return "text-primary";
    case ReviewHistoryAction.RECHECK:
      return "text-amber-500";
    case ReviewHistoryAction.NEW_ISSUES_FOUND:
      return "text-destructive";
    case ReviewHistoryAction.ISSUES_FIXED:
      return "text-green-500";
    case ReviewHistoryAction.ISSUES_PARTIALLY_FIXED:
      return "text-amber-500";
    default:
      return "text-muted-foreground";
  }
}
