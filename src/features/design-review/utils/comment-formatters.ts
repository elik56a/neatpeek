/**
 * Utility functions for formatting Figma comments
 * These functions ensure consistent formatting of comments across the application
 */

import { BrandIssue, GeneralIssue, IssueSeverity, IssueStatus } from "../types";

export function getCommentBotPrefix(): string {
  return "[🤖 NeatPeek AI Bot] \n \n";
}

/**
 * Get emoji for severity level
 */
export function getSeverityEmoji(severity: IssueSeverity): string {
  switch (severity) {
    case IssueSeverity.HIGH:
      return "🚨"; // Red alert for high severity
    case IssueSeverity.MEDIUM:
      return "⚠️"; // Warning for medium severity
    case IssueSeverity.LOW:
      return "ℹ️"; // Info for low severity
    case IssueSeverity.OPTIONAL:
      return "💭"; // Thought bubble for optional/suggestion
    default:
      return "⚠️"; // Default to warning
  }
}

/**
 * Format a brand issue as a Figma comment
 *
 * Example output:
 * 🚨 HIGH Brand Issue: Poor contrast between text and background
 * 📋 Rule: Brand colors must maintain proper contrast - removed .
 * 💡 Fix: Use primary colors with higher contrast
 */
export function formatBrandIssueComment(issue: BrandIssue): string {
  const severityEmoji = getSeverityEmoji(issue.severity);
  const severityText = issue.severity.toUpperCase();
  const commentPrefix = getCommentBotPrefix();

  // Only include the fix suggestion if it exists
  const fixPart = issue.fix_suggestion ? `\n💡 Fix: ${issue.fix_suggestion}` : "";

  return `${commentPrefix}${severityEmoji} ${severityText} Brand Issue: ${issue.description}${fixPart}`;
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
  const issueType = issue.issue_type || "UX";
  const commentPrefix = getCommentBotPrefix();

  // Only include the fix suggestion if it exists
  const fixPart = issue.fix_suggestion ? `\n💡 Fix: ${issue.fix_suggestion}` : "";

  return `${commentPrefix}${severityEmoji} ${severityText} ${issueType} Issue: \n ${issue.description}${fixPart}`;
}

/**
 * Format a recheck result as a Figma thread comment
 */
export function formatRecheckComment(status: IssueStatus, details?: string): string {
  switch (status) {
    case IssueStatus.FIXED:
      return `✅ Fixed. Great job!`;
    case IssueStatus.PARTIALLY_FIXED:
      return `🔸 Partially fixed.${details ? `\n${details}` : ""}`;
    case IssueStatus.NOT_FIXED:
      return `👀 Issue still exists.`;
    case IssueStatus.NEW:
      return `🆕 New issue found during recheck.${details ? `\n${details}` : ""}`;
    default:
      return `⚠️ Status unknown.${details ? `\n${details}` : ""}`;
  }
}

/**
 * Format a new issue comment with special formatting
 */
export function formatNewIssueComment(issue: BrandIssue | GeneralIssue): string {
  // Determine if it's a brand issue or general issue
  const isBrandIssue = "brand_rule_violation" in issue;

  // Format the comment with a 🆕 NEW prefix on its own line
  if (isBrandIssue) {
    const brandComment = formatBrandIssueComment(issue as BrandIssue);
    return `🆕 NEW\n${brandComment}`;
  } else {
    const generalComment = formatGeneralIssueComment(issue as GeneralIssue);
    return `🆕 NEW\n${generalComment}`;
  }
}
