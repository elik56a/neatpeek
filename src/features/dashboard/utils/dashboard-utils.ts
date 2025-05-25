import { format, subDays, formatDistanceToNow } from "date-fns";
import { DatePeriod, DashboardStatus, ActivityType } from "../types";

/**
 * Format date for chart display
 */
export function formatChartDate(date: string, period: DatePeriod): string {
  const dateObj = new Date(date);

  switch (period) {
    case DatePeriod.SEVEN_DAYS:
      return format(dateObj, "MMM dd");
    case DatePeriod.THIRTY_DAYS:
      return format(dateObj, "MMM dd");
    case DatePeriod.NINETY_DAYS:
      return format(dateObj, "MMM dd");
    case DatePeriod.ONE_YEAR:
      return format(dateObj, "MMM yyyy");
    default:
      return format(dateObj, "MMM dd");
  }
}

/**
 * Convert camelCase/snake_case property names to readable labels
 */
export function formatChartLabel(key: string): string {
  const labelMap: Record<string, string> = {
    // Chart data labels
    reviews: "Reviews",
    passRate: "Pass Rate",
    consistencyScore: "Consistency Score",
    totalReviews: "Total Reviews",
    passingRate: "Passing Rate",
    brandConsistencyScore: "Brand Consistency",
    activeReviews: "Active Reviews",

    // Design types
    desktop: "Desktop",
    mobile: "Mobile",
    tablet: "Tablet",
    web: "Web",
    email: "Email",
    social: "Social",

    // Other common labels
    count: "Count",
    percentage: "Percentage",
    value: "Value",
    name: "Name",
    type: "Type",
    device: "Device",
  };

  // Return mapped label if exists
  if (labelMap[key]) {
    return labelMap[key];
  }

  // Convert camelCase to Title Case
  return key
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .replace(/_/g, " ") // Replace underscores with spaces
    .trim();
}

/**
 * Format chart date for X-axis display (shorter format)
 */
export function formatChartXAxisDate(date: string): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return format(dateObj, "EEE"); // Mon, Tue, etc.
  if (diffDays < 30) return format(dateObj, "MMM d"); // Jan 15
  return format(dateObj, "MMM d"); // Jan 15
}

/**
 * Format percentage with proper suffix
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Get status badge variant for UI components
 */
export function getStatusVariant(
  status: DashboardStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case DashboardStatus.PASSED:
      return "default";
    case DashboardStatus.FAILED:
      return "destructive";
    case DashboardStatus.PENDING:
      return "outline";
    case DashboardStatus.PROCESSING:
      return "secondary";
    case DashboardStatus.COMPLETED:
      return "default";
    default:
      return "outline";
  }
}

/**
 * Get activity type icon name
 */
export function getActivityIcon(type: ActivityType): string {
  switch (type) {
    case ActivityType.DESIGN_REVIEW:
      return "FileText";
    case ActivityType.BRAND_UPDATE:
      return "Palette";
    case ActivityType.GUIDELINE_CREATED:
      return "BookOpen";
    case ActivityType.BRAND_RULE_CREATED:
      return "Settings";
    case ActivityType.DESIGN_UPLOADED:
      return "Upload";
    default:
      return "Circle";
  }
}

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Format growth display
 */
export function formatGrowth(growth: number): string {
  const sign = growth >= 0 ? "+" : "";
  return `${sign}${growth}%`;
}

/**
 * Get chart colors for different data series using hex values for Recharts
 * Using your brand colors with beautiful complementary colors
 */
export function getChartColors(theme?: "light" | "dark"): {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
} {
  return {
    primary: "#8344FF", // Your brand color - beautiful violet
    secondary: "#06b6d4", // Cyan - modern accent
    success: "#10b981", // Emerald - success states
    warning: "#f59e0b", // Amber - warning states
    danger: "#ef4444", // Red - error states
    info: "#3b82f6", // Blue - informational
  };
}

/**
 * Generate date range for charts
 */
export function generateDateRange(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - i - 1);
    return format(date, "yyyy-MM-dd");
  });
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Calculate pass rate with proper handling of edge cases
 */
export function calculatePassRate(passed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((passed / total) * 100);
}

/**
 * Get period display name
 */
export function getPeriodDisplayName(period: DatePeriod): string {
  switch (period) {
    case DatePeriod.SEVEN_DAYS:
      return "Last 7 days";
    case DatePeriod.THIRTY_DAYS:
      return "Last 30 days";
    case DatePeriod.NINETY_DAYS:
      return "Last 90 days";
    case DatePeriod.ONE_YEAR:
      return "Last year";
    default:
      return "Last 30 days";
  }
}
