/**
 * TypeScript interfaces for review history
 * These interfaces define the shape of the data stored in the ReviewHistory model
 */

/**
 * Enum for review history action
 * This should match the ReviewHistoryAction enum in the Prisma schema
 * We're now importing this directly from Prisma
 */
export { ReviewHistoryAction } from '@prisma/client';

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
  // Additional data for session-based history
  additional_data?: Record<string, any>;
}
