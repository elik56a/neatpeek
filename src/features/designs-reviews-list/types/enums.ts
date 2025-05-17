/**
 * Sort fields available for designs reviews list
 */
export enum DesignsReviewSortField {
  NAME = "name",
  BRAND_GUIDELINE = "brandGuideline",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  STATUS = "status",
  SCORE = "score",
  BRAND_ISSUES_COUNT = "brandIssuesCount",
  GENERAL_ISSUES_COUNT = "generalIssuesCount",
  TOTAL_ISSUES_COUNT = "issuesCount",
}

/**
 * View mode for designs reviews list
 */
export enum ViewMode {
  TABLE = "TABLE",
  GRID = "GRID",
}
