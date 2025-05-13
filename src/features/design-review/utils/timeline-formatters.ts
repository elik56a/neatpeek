/**
 * Utility functions for formatting review timeline entries
 * These functions generate human-readable summaries for the timeline
 */

import { BrandIssue, GeneralIssue, IssueStatus } from "../types";

/**
 * Interface for issue counts by status
 */
interface IssueCounts {
  fixed: number;
  partially_fixed: number;
  not_fixed: number;
  new: number;
  total: number;
}

/**
 * Count issues by status
 */
export function countIssuesByStatus(
  brandIssues: BrandIssue[],
  generalIssues: GeneralIssue[]
): IssueCounts {
  const counts: IssueCounts = {
    fixed: 0,
    partially_fixed: 0,
    not_fixed: 0,
    new: 0,
    total: brandIssues.length + generalIssues.length,
  };

  // Count brand issues
  for (const issue of brandIssues) {
    if (issue.status === IssueStatus.FIXED) {
      counts.fixed++;
    } else if (issue.status === IssueStatus.PARTIALLY_FIXED) {
      counts.partially_fixed++;
    } else if (issue.status === IssueStatus.NOT_FIXED) {
      counts.not_fixed++;
    } else if (issue.status === IssueStatus.NEW) {
      counts.new++;
    }
  }

  // Count general issues
  for (const issue of generalIssues) {
    if (issue.status === IssueStatus.FIXED) {
      counts.fixed++;
    } else if (issue.status === IssueStatus.PARTIALLY_FIXED) {
      counts.partially_fixed++;
    } else if (issue.status === IssueStatus.NOT_FIXED) {
      counts.not_fixed++;
    } else if (issue.status === IssueStatus.NEW) {
      counts.new++;
    }
  }

  return counts;
}

/**
 * Generate a summary for initial timeline review
 */
export function generateInitialReviewSummary(
  brandIssues: BrandIssue[],
  generalIssues: GeneralIssue[]
): string {
  const totalIssues = brandIssues.length + generalIssues.length;
  const brandCount = brandIssues.length;
  const generalCount = generalIssues.length;

  if (totalIssues === 0) {
    return "Initial review completed. No issues found.";
  }

  let summary = `Initial review completed. Found ${totalIssues} issue${totalIssues !== 1 ? "s" : ""}.`;

  if (brandCount > 0) {
    summary += ` ${brandCount} brand issue${brandCount !== 1 ? "s" : ""}.`;
  }

  if (generalCount > 0) {
    summary += ` ${generalCount} general issue${generalCount !== 1 ? "s" : ""}.`;
  }

  return summary;
}

/**
 * Generate a summary for recheck
 */
export function generateRecheckSummary(counts: IssueCounts): string {
  const parts: string[] = [];

  if (counts.fixed > 0) {
    parts.push(`${counts.fixed} issue${counts.fixed !== 1 ? "s" : ""} fixed`);
  }

  if (counts.partially_fixed > 0) {
    parts.push(`${counts.partially_fixed} partially fixed`);
  }

  if (counts.not_fixed > 0) {
    parts.push(`${counts.not_fixed} not fixed`);
  }

  if (counts.new > 0) {
    parts.push(`${counts.new} new issue${counts.new !== 1 ? "s" : ""} found`);
  }

  if (parts.length === 0) {
    return "Recheck completed. No changes detected.";
  }

  return `Recheck completed. ${parts.join(", ")}.`;
}

/**
 * Generate a summary for new issues
 */
export function generateNewIssuesSummary(newIssues: (BrandIssue | GeneralIssue)[]): string {
  if (newIssues.length === 0) {
    return "No new issues found during recheck.";
  }

  // Count brand vs general issues
  const brandIssues = newIssues.filter(issue => "brand_rule_violation" in issue);
  const generalIssues = newIssues.filter(issue => !("brand_rule_violation" in issue));

  let summary = `Found ${newIssues.length} new issue${newIssues.length !== 1 ? "s" : ""} during recheck.`;

  if (brandIssues.length > 0) {
    summary += ` ${brandIssues.length} brand issue${brandIssues.length !== 1 ? "s" : ""}.`;
  }

  if (generalIssues.length > 0) {
    summary += ` ${generalIssues.length} general issue${generalIssues.length !== 1 ? "s" : ""}.`;
  }

  return summary;
}

/**
 * Generate a changes object for history entry
 */
export function generateHistoryChanges(
  counts: IssueCounts,
  newIssues?: (BrandIssue | GeneralIssue)[]
) {
  const changes: any = {
    fixed_count: counts.fixed,
    partially_fixed_count: counts.partially_fixed,
    not_fixed_count: counts.not_fixed,
  };

  if (newIssues && newIssues.length > 0) {
    changes.new_issues_count = newIssues.length;
    changes.issues_summary = newIssues.map(issue => ({
      type: "brand_rule_violation" in issue ? "brand_issue" : "general_issue",
      description: issue.description,
      severity: issue.severity,
    }));
  }

  return changes;
}
