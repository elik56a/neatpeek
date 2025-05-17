import {
  DesignsReview,
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
  designsReview: DesignsReview
): DesignReviewExportRow[] {
  const exportData: DesignReviewExportRow[] = [];

  // Process each review
  designsReview.designs.forEach(design => {
    const frameName = design.fileName || "Unknown";
    const frameId = design.frameId || "Unknown";

    // Add brand issues
    if (design.reviewJson.brand_issues && design.reviewJson.brand_issues.length > 0) {
      design.reviewJson.brand_issues.forEach(issue => {
        exportData.push({
          frame: frameName,
          frameId,
          issueType: "Brand Issue",
          category: issue.brand_rule_violation || "",
          severity: issue.severity || "",
          description: issue.description || "",
          recommendation: issue.fix_suggestion || "",
          status: issue.status || "PENDING",
        });
      });
    }

    // Add general issues
    if (design.reviewJson.general_issues && design.reviewJson.general_issues.length > 0) {
      design.reviewJson.general_issues.forEach(issue => {
        exportData.push({
          frame: frameName,
          frameId,
          issueType: "General Issue",
          category: issue.issue_type || "",
          severity: issue.severity || "",
          description: issue.description || "",
          recommendation: issue.fix_suggestion || "",
          status: issue.status || "PENDING",
        });
      });
    }

    // Add positive aspects
    if (design.reviewJson.positive_aspects && design.reviewJson.positive_aspects.length > 0) {
      design.reviewJson.positive_aspects.forEach(aspect => {
        exportData.push({
          frame: frameName,
          frameId,
          issueType: "Positive Aspect",
          category: aspect.element_type || "",
          severity: "High",
          description: aspect.description || "",
          recommendation: "",
          status: "N/A",
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
    frameId: "Frame ID",
    issueType: "Issue Type",
    category: "Category",
    severity: "Severity",
    description: "Description",
    recommendation: "Recommendation",
    status: "Status",
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
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    filename = `${filename}_${timestamp}`;
  }

  // Add file extension
  filename = `${filename}.${options.fileType || "csv"}`;

  return filename;
}

/**
 * Sort issues by severity
 * @param issues Array of issues with severity
 * @returns Sorted array of issues
 */
export function sortIssuesBySeverity<T extends { severity: string }>(issues: T[]): T[] {
  const severityOrder = {
    [IssueSeverity.HIGH]: 0,
    [IssueSeverity.MEDIUM]: 1,
    [IssueSeverity.LOW]: 2,
    [IssueSeverity.OPTIONAL]: 3,
  };

  return [...issues].sort((a, b) => {
    const severityA = severityOrder[a.severity] ?? 4;
    const severityB = severityOrder[b.severity] ?? 4;
    return severityA - severityB;
  });
}

/**
 * Extract hex colors from text
 * @param text Text to extract colors from
 * @returns Array of hex colors
 */
export function extractHexColors(text: string): string[] {
  const hexColorRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/g;
  const matches = text.match(hexColorRegex);
  return matches || [];
}
