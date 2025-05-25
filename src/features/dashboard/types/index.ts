import { IssueSeverity } from "@/features/design-review/types";
import { ReviewStatus } from "@/features/design-review/types/review-status";

// Re-export imported types
export { IssueSeverity };

// Dashboard-specific enums
export enum ActivityType {
  DESIGN_REVIEW = "design-review",
  BRAND_UPDATE = "brand-update",
  GUIDELINE_CREATED = "guideline-created",
  BRAND_RULE_CREATED = "brand-rule-created",
  DESIGN_UPLOADED = "design-uploaded",
}

export enum DashboardStatus {
  PASSED = "passed",
  FAILED = "failed",
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
}

export enum ImpactLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum DatePeriod {
  SEVEN_DAYS = "7d",
  THIRTY_DAYS = "30d",
  NINETY_DAYS = "90d",
  ONE_YEAR = "1y",
}

// Chart data interfaces
export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MultiTrendData {
  date: string;
  [key: string]: string | number;
}

// Dashboard metrics interfaces
export interface DashboardMetrics {
  totalReviews: number;
  passingRate: number;
  brandConsistencyScore: number;
  activeReviews: number;
  totalBrandGuidelines: number;
  monthlyGrowth: {
    totalReviews: number;
    passingRate: number;
    brandConsistencyScore: number;
  };
}

// Activity and trends
export interface ActivityTrend {
  date: string;
  reviews: number;
  passRate: number;
  consistencyScore: number;
}

// Issue analysis
export interface IssueCategory {
  category: string;
  count: number;
  percentage: number;
  severity: IssueSeverity;
}

export interface IssueTrend {
  date: string;
  critical: number;
  major: number;
  minor: number;
}

// Design breakdown
export interface DesignTypeBreakdown {
  type: string;
  count: number;
  passRate: number;
}

export interface DeviceBreakdown {
  device: string;
  count: number;
  percentage: number;
}

// Brand guidelines stats
export interface BrandGuidelineStats {
  total: number;
  completed: number;
  processing: number;
  failed: number;
  mostUsedRules: Array<{
    ruleName: string;
    category: string;
    usageCount: number;
  }>;
}

// Recent activity
export interface RecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  status: DashboardStatus;
  createdAt: string;
  updatedAt: string;
  projectName?: string;
  designType?: string;
  issueCount?: number;
}

// Performance insights
export interface PerformanceInsights {
  averageResolutionTime: number; // in hours
  improvementAreas: Array<{
    category: string;
    suggestion: string;
    impact: ImpactLevel;
  }>;
  personalBest: {
    highestConsistencyScore: number;
    longestPassStreak: number;
    fastestResolution: number; // in hours
  };
  weeklyProgress: {
    thisWeek: {
      reviews: number;
      passRate: number;
      avgScore: number;
    };
    lastWeek: {
      reviews: number;
      passRate: number;
      avgScore: number;
    };
  };
}

// Main dashboard data interface
export interface DashboardData {
  metrics: DashboardMetrics;
  activityTrends: ActivityTrend[];
  issueAnalysis: {
    topIssues: IssueCategory[];
    issueTrends: IssueTrend[];
  };
  designBreakdown: {
    byType: DesignTypeBreakdown[];
    byDevice: DeviceBreakdown[];
  };
  brandGuidelineStats: BrandGuidelineStats;
  recentActivity: RecentActivity[];
  performanceInsights: PerformanceInsights;
}

// API response interface
export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}

// Date range for filtering
export interface DateRange {
  start: string;
  end: string;
  period: DatePeriod;
}

// Dashboard filters
export interface DashboardFilters {
  dateRange: DateRange;
  designTypes?: string[];
  projects?: string[];
  brandGuidelines?: string[];
}
