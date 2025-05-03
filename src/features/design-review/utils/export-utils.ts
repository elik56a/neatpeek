import {
  DesignAnalysisResult,
  DesignReviewExportRow,
  DesignReviewExportOptions,
  IssueSeverity,
} from "../types";

/**
 * Prepare design review data for export
 * @param result Design analysis result
 * @returns Array of export data rows
 */
export function prepareDesignReviewExportData(
  result: DesignAnalysisResult
): DesignReviewExportRow[] {
  const exportData: DesignReviewExportRow[] = [];

  // Process each review
  result.reviews.forEach(review => {
    const frameName = review.image?.name || "Unknown";

    // Add brand issues
    if (review.brand_issues && review.brand_issues.length > 0) {
      review.brand_issues.forEach(issue => {
        exportData.push({
          frame: frameName,
          issueType: "Brand Issue",
          category: issue.element_type || "",
          severity: issue.severity || "",
          description: issue.description || "",
          recommendation: issue.fix_suggestion || "",
        });
      });
    }

    // Add general issues
    if (review.general_issues && review.general_issues.length > 0) {
      review.general_issues.forEach(issue => {
        exportData.push({
          frame: frameName,
          issueType: "General Issue",
          category: issue.element_type || "",
          severity: issue.severity || "",
          description: issue.description || "",
          recommendation: issue.fix_suggestion || "",
        });
      });
    }

    // Add positive aspects
    if (review.positive_aspects && review.positive_aspects.length > 0) {
      review.positive_aspects.forEach(aspect => {
        exportData.push({
          frame: frameName,
          issueType: "Positive Aspect",
          category: aspect.element_type || "",
          severity: aspect.impact || "",
          description: aspect.description || "",
          recommendation: "",
        });
      });
    }
  });

  return exportData;
}

/**
 * Get export headers for design review
 * @returns Object mapping data keys to display names
 */
export function getDesignReviewExportHeaders() {
  return {
    frame: "Frame",
    issueType: "Issue Type",
    category: "Category",
    severity: "Severity",
    description: "Description",
    recommendation: "Recommendation",
  };
}

/**
 * Generate a dynamic filename for the export
 * @param options Export options
 * @param figmaFileName Optional Figma file name
 * @returns Formatted filename
 */
export function generateExportFilename(
  options: DesignReviewExportOptions,
  figmaFileName?: string
): string {
  let filename = options.fileName || "design_review_report";

  // Add Figma filename if available and requested
  if (options.includeFigmaFileName && figmaFileName) {
    // Clean up the Figma filename to be safe for filenames
    const cleanFigmaName = figmaFileName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    filename = `${filename}_${cleanFigmaName}`;
  }

  // Add timestamp if requested
  if (options.includeTimestamp) {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    filename = `${filename}_${timestamp}`;
  }

  return filename;
}

/**
 * Sort design issues by severity
 * @param issues Array of design issues
 * @returns Sorted array with high severity first, optional last
 */
export function sortIssuesBySeverity<T extends { severity: string }>(issues: T[]): T[] {
  const severityOrder = {
    [IssueSeverity.HIGH]: 0,
    [IssueSeverity.MEDIUM]: 1,
    [IssueSeverity.LOW]: 2,
    [IssueSeverity.OPTIONAL]: 3,
  };

  return [...issues].sort((a, b) => {
    const aSeverity = (a.severity || IssueSeverity.LOW).toLowerCase();
    const bSeverity = (b.severity || IssueSeverity.LOW).toLowerCase();

    // Default to lowest priority (OPTIONAL) if severity is not in the order map
    const aOrder =
      severityOrder[aSeverity as keyof typeof severityOrder] ??
      severityOrder[IssueSeverity.OPTIONAL];
    const bOrder =
      severityOrder[bSeverity as keyof typeof severityOrder] ??
      severityOrder[IssueSeverity.OPTIONAL];

    return aOrder - bOrder;
  });
}

/**
 * Extract hex color codes from text
 * @param text Text to search for hex codes
 * @returns Array of hex color codes
 */
export function extractHexColors(text: string): string[] {
  if (!text) return [];

  const hexRegex = /#([0-9A-F]{6})/gi;
  const matches = text.match(hexRegex);
  return matches ? matches : [];
}
