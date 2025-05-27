import { ReviewStatus } from "@prisma/client";

/**
 * Check if a design review is currently being processed
 */
export function isReviewProcessing(status: ReviewStatus): boolean {
  return status === ReviewStatus.PENDING || status === ReviewStatus.IN_PROGRESS;
}

/**
 * Check if a design review has completed successfully
 */
export function isReviewCompleted(status: ReviewStatus): boolean {
  return status === ReviewStatus.COMPLETED;
}

/**
 * Check if a design review has failed
 */
export function isReviewFailed(status: ReviewStatus): boolean {
  return status === ReviewStatus.FAILED;
}

/**
 * Check if status is pending
 */
export function isReviewPending(status: ReviewStatus): boolean {
  return status === ReviewStatus.PENDING;
}

/**
 * Check if status is in progress
 */
export function isReviewInProgress(status: ReviewStatus): boolean {
  return status === ReviewStatus.IN_PROGRESS;
}

/**
 * Get progress percentage based on status
 */
export function getProgressByStatus(status: ReviewStatus): number {
  switch (status) {
    case ReviewStatus.PENDING:
      return 15;
    case ReviewStatus.IN_PROGRESS:
      return 85;
    case ReviewStatus.COMPLETED:
      return 100;
    case ReviewStatus.FAILED:
      return 0;
    default:
      return 0;
  }
}

/**
 * Get processing steps for the analysis
 */
export function getProcessingSteps(): string[] {
  return [
    "Initializing analysis engine",
    "Fetching design data from Figma",
    "Processing design elements",
    "Running AI brand compliance scan",
    "Analyzing color schemes and typography",
    "Checking layout and composition",
    "Generating detailed feedback",
    "Finalizing results",
  ];
}
