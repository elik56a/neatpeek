/**
 * Utility functions for mapping enums to human-readable labels and UI properties
 */

import { IssueStatus, IssueSeverity, ReviewTimelineAction } from "../types";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileSearch,
  MinusCircle,
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

/**
 * Maps an IssueStatus to a human-readable label
 * @param status The status to map
 * @returns A human-readable label
 */
export function getStatusLabel(status: IssueStatus): string {
  switch (status) {
    case IssueStatus.FIXED:
      return "Fixed";
    case IssueStatus.PARTIALLY_FIXED:
      return "Partially Fixed";
    case IssueStatus.NOT_FIXED:
      return "Not Fixed";
    case IssueStatus.NEW:
      return "New";
    default:
      return status;
  }
}

/**
 * Maps an IssueStatus to a badge variant
 * @param status The status to map
 * @returns A badge variant
 */
export function getStatusBadgeVariant(status: IssueStatus): string {
  switch (status) {
    case IssueStatus.FIXED:
      return "success";
    case IssueStatus.PARTIALLY_FIXED:
      return "warning";
    case IssueStatus.NOT_FIXED:
      return "destructive";
    case IssueStatus.NEW:
      return "default";
    default:
      return "outline";
  }
}

/**
 * Maps an IssueStatus to an icon
 * @param status The status to map
 * @returns An icon component
 */
export function getStatusIcon(status: IssueStatus): LucideIcon {
  switch (status) {
    case IssueStatus.FIXED:
      return CheckCircle2;
    case IssueStatus.PARTIALLY_FIXED:
      return MinusCircle;
    case IssueStatus.NOT_FIXED:
      return AlertCircle;
    case IssueStatus.NEW:
      return PlusCircle;
    default:
      return AlertCircle;
  }
}

/**
 * Maps an IssueStatus to a color
 * @param status The status to map
 * @returns A color class
 */
export function getStatusColor(status: IssueStatus): string {
  switch (status) {
    case IssueStatus.FIXED:
      return "text-green-500";
    case IssueStatus.PARTIALLY_FIXED:
      return "text-amber-500";
    case IssueStatus.NOT_FIXED:
      return "text-destructive";
    case IssueStatus.NEW:
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
}

/**
 * Maps an IssueSeverity to a human-readable label
 * @param severity The severity to map
 * @returns A human-readable label
 */
export function getSeverityLabel(severity: IssueSeverity): string {
  switch (severity) {
    case IssueSeverity.HIGH:
      return "HIGH";
    case IssueSeverity.MEDIUM:
      return "MEDIUM";
    case IssueSeverity.LOW:
      return "LOW";
    case IssueSeverity.OPTIONAL:
      return "OPTIONAL";
    default:
      return severity;
  }
}

/**
 * Maps an IssueSeverity to a badge variant
 * @param severity The severity to map
 * @returns A badge variant
 */
export function getSeverityBadgeVariant(severity: IssueSeverity): string {
  switch (severity) {
    case IssueSeverity.HIGH:
      return "destructive";
    case IssueSeverity.MEDIUM:
      return "default";
    case IssueSeverity.LOW:
      return "outline";
    case IssueSeverity.OPTIONAL:
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Gets the CSS classes for a severity badge
 * @param severity The severity to get classes for
 * @returns CSS class string
 */
export function getSeverityBadgeClasses(severity: IssueSeverity): string {
  switch (severity) {
    case IssueSeverity.OPTIONAL:
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    default:
      return "";
  }
}
