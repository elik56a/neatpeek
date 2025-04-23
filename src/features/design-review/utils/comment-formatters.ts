/**
 * Utility functions for formatting Figma comments
 * These functions ensure consistent formatting of comments across the application
 */

import { BrandIssue, GeneralIssue, IssueSeverity } from '../types';

/**
 * Get emoji for severity level
 */
export function getSeverityEmoji(severity: IssueSeverity): string {
  switch (severity) {
    case 'high':
      return '🚨'; // Red alert for high severity
    case 'medium':
      return '⚠️'; // Warning for medium severity
    case 'low':
      return 'ℹ️'; // Info for low severity
    default:
      return '⚠️'; // Default to warning
  }
}

/**
 * Format a brand issue as a Figma comment
 * 
 * Example output:
 * 🚨 HIGH Brand Issue: Poor contrast between text and background
 * 📋 Rule: Brand colors must maintain proper contrast
 * 💡 Fix: Use primary colors with higher contrast
 */
export function formatBrandIssueComment(issue: BrandIssue): string {
  const severityEmoji = getSeverityEmoji(issue.severity);
  const severityText = issue.severity.toUpperCase();
  
  return `${severityEmoji} ${severityText} Brand Issue: ${issue.description}\n📋 Rule: ${issue.brand_rule_violation}\n💡 Fix: ${issue.fix_suggestion}`;
}

/**
 * Format a general issue as a Figma comment
 * 
 * Example output:
 * ⚠️ MEDIUM UX Issue: Button too small for touch targets
 * 💡 Fix: Increase button size to at least 44px
 */
export function formatGeneralIssueComment(issue: GeneralIssue): string {
  const severityEmoji = getSeverityEmoji(issue.severity);
  const severityText = issue.severity.toUpperCase();
  const issueType = issue.issue_type || 'UX';
  
  return `${severityEmoji} ${severityText} ${issueType} Issue: ${issue.description}\n💡 Fix: ${issue.fix_suggestion}`;
}

/**
 * Format a recheck result as a Figma thread comment
 */
export function formatRecheckComment(status: string, details?: string): string {
  switch (status) {
    case 'fixed':
      return `✅ Fixed! The issue has been resolved.${details ? `\n${details}` : ''}`;
    case 'partially_fixed':
      return `🔸 Partially fixed.${details ? `\n${details}` : ''}`;
    case 'not_fixed':
      return `👀 Issue still exists. Please address this issue.${details ? `\n${details}` : ''}`;
    case 'new':
      return `🆕 New issue found during recheck.${details ? `\n${details}` : ''}`;
    default:
      return `⚠️ Status unknown.${details ? `\n${details}` : ''}`;
  }
}

/**
 * Format a new issue comment with special formatting
 */
export function formatNewIssueComment(issue: BrandIssue | GeneralIssue): string {
  // Determine if it's a brand issue or general issue
  const isBrandIssue = 'brand_rule_violation' in issue;
  
  // Format the comment with a 🆕 prefix
  if (isBrandIssue) {
    return `🆕 NEW ${formatBrandIssueComment(issue as BrandIssue)}`;
  } else {
    return `🆕 NEW ${formatGeneralIssueComment(issue as GeneralIssue)}`;
  }
}
