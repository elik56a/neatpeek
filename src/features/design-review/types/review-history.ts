/**
 * TypeScript interfaces for review history
 * These interfaces define the shape of the data stored in the ReviewHistory model
 */

/**
 * Enum for review history action
 * This should match the ReviewHistoryAction enum in the Prisma schema
 */
export enum ReviewHistoryAction {
  INITIAL_REVIEW = 'INITIAL_REVIEW',
  RECHECK = 'RECHECK',
  NEW_ISSUES_FOUND = 'NEW_ISSUES_FOUND',
  ISSUES_FIXED = 'ISSUES_FIXED',
  ISSUES_PARTIALLY_FIXED = 'ISSUES_PARTIALLY_FIXED',
}

/**
 * Interface for issue summary in history changes
 */
export interface IssueSummary {
  type: string;
  description: string;
  severity: string;
}

/**
 * Interface for history changes
 */
export interface HistoryChanges {
  fixed_count: number;
  partially_fixed_count: number;
  not_fixed_count: number;
  new_issues_count?: number;
  issues_summary?: IssueSummary[];
  brand_issues_count?: number;
  general_issues_count?: number;
  total_issues_count?: number;
  design_score?: number;
}
