import { prisma } from "@/services/db";
import {
  DashboardData,
  DashboardFilters,
  DateRange,
  DatePeriod,
  ActivityType,
  DashboardStatus,
  IssueSeverity,
  ImpactLevel,
  DashboardMetrics,
} from "../types";
import {
  BaseIssue,
  BrandIssue,
  Design,
  DesignsReview,
  GeneralIssue,
  ReviewStatus,
} from "@/features/design-review";
import { BrandGuideline, BrandGuidelineStatus } from "@/features/brand-setup/types";

class DashboardService {
  private readonly passRateThreshold = 70;
  /**
   * Get comprehensive dashboard data for a user
   */
  async getDashboardData(userId: string, filters?: DashboardFilters): Promise<DashboardData> {
    const dateRange = filters?.dateRange || this.getDateRangeFromPeriod(DatePeriod.THIRTY_DAYS);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    // Fetch user's design reviews
    const designReviews = (await prisma.designsReview.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(filters?.projects?.length && {
          OR: filters.projects.map(project => ({
            figmaFileId: { contains: project },
          })),
        }),
      },
      include: {
        designs: {
          include: {
            timeline: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })) as unknown as DesignsReview[];

    // Fetch user's brand guidelines
    const brandGuidelines = (await prisma.brandGuideline.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        brandRules: true,
        customRules: true,
      },
    })) as unknown as BrandGuideline[];

    // Calculate main metrics
    const metrics = await this.calculateMetrics(
      userId,
      designReviews,
      brandGuidelines,
      startDate,
      endDate
    );

    // Generate activity trends
    const activityTrends = this.generateActivityTrends(designReviews, startDate, endDate);

    // Analyze issues
    const issueAnalysis = this.analyzeIssues(designReviews);

    // Generate design breakdown
    const designBreakdown = this.generateDesignBreakdown(designReviews);

    // Generate brand guideline stats
    const brandGuidelineStats = this.generateBrandGuidelineStats(brandGuidelines);

    // Generate recent activity
    const recentActivity = this.generateRecentActivity(designReviews, brandGuidelines);

    // Generate performance insights
    const performanceInsights = this.generatePerformanceInsights(designReviews, metrics);

    return {
      metrics,
      activityTrends,
      issueAnalysis,
      designBreakdown,
      brandGuidelineStats,
      recentActivity,
      performanceInsights,
    };
  }

  /**
   * Calculate main dashboard metrics
   */
  private async calculateMetrics(
    userId: string,
    designReviews: DesignsReview[],
    brandGuidelines: BrandGuideline[],
    startDate: Date,
    endDate: Date
  ): Promise<DashboardMetrics> {
    const totalReviews = designReviews.length;

    // Get all designs from the reviews to analyze them
    const allDesigns = designReviews.flatMap(review => review.designs || []);
    const passedDesigns = allDesigns.filter(
      design =>
        design.reviewJson && design.reviewJson?.design_score?.total >= this.passRateThreshold
    ).length;
    const passingRate = this.calculatePassRate(passedDesigns, allDesigns.length);

    // Calculate average consistency score
    const consistencyScores = allDesigns
      .filter(design => design.reviewJson && design.reviewJson?.design_score)
      .map(design => design.reviewJson.design_score.total);
    const brandConsistencyScore = this.calculateAverageScore(consistencyScores);

    const activeReviews = designReviews.filter(
      review => review.status === ReviewStatus.PENDING || review.status === ReviewStatus.IN_PROGRESS
    ).length;

    // Get previous period for growth calculation
    const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);

    const prevReviews = (await prisma.designsReview.findMany({
      where: {
        userId,
        createdAt: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
      include: {
        designs: true,
      },
    })) as unknown as DesignsReview[];

    const prevDesigns = prevReviews.flatMap(review => review.designs || []);
    const prevPassedDesigns = prevDesigns.filter(
      design =>
        design.reviewJson && design.reviewJson?.design_score?.total >= this.passRateThreshold
    ).length;
    const prevPassingRate = this.calculatePassRate(prevPassedDesigns, prevDesigns.length);

    const prevConsistencyScores = prevDesigns
      .filter(design => design.reviewJson && design.reviewJson?.design_score)
      .map(design => design.reviewJson.design_score.total);
    const prevBrandConsistency = this.calculateAverageScore(prevConsistencyScores);

    return {
      totalReviews,
      passingRate,
      brandConsistencyScore,
      activeReviews,
      totalBrandGuidelines: brandGuidelines.length,
      monthlyGrowth: {
        totalReviews: totalReviews - prevReviews.length,
        passingRate: passingRate - prevPassingRate,
        brandConsistencyScore: brandConsistencyScore - prevBrandConsistency,
      },
    };
  }

  /**
   * Generate activity trends data
   */
  private generateActivityTrends(designReviews: DesignsReview[], startDate: Date, endDate: Date) {
    const activityTrends = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayReviews = designReviews.filter(
        review => review.createdAt >= dayStart && review.createdAt <= dayEnd
      );

      const dayDesigns = dayReviews.flatMap(review => review.designs || []);
      const dayPassed = dayDesigns.filter(
        design =>
          design.reviewJson && design.reviewJson?.design_score?.total >= this.passRateThreshold
      ).length;

      const dayScores = dayDesigns
        .filter(design => design.reviewJson && design.reviewJson?.design_score)
        .map(design => design.reviewJson.design_score.total);

      activityTrends.push({
        date: d.toISOString().split("T")[0],
        reviews: dayReviews.length,
        passRate: this.calculatePassRate(dayPassed, dayDesigns.length),
        consistencyScore: this.calculateAverageScore(dayScores),
      });
    }

    return activityTrends;
  }

  /**
   * Analyze issues from design reviews
   */
  private analyzeIssues(designReviews: DesignsReview[]) {
    const allIssues: Array<{ category: string; severity: IssueSeverity }> = [];

    designReviews.forEach(review => {
      if (review.designs) {
        review.designs.forEach(design => {
          if (design.reviewJson) {
            const reviewData = design.reviewJson;
            if (reviewData.brand_issues) {
              reviewData.brand_issues.forEach(issue => {
                allIssues.push({
                  category: issue.category || "Brand Compliance",
                  severity: issue.severity || IssueSeverity.MEDIUM,
                });
              });
            }
            if (reviewData.general_issues) {
              reviewData.general_issues.forEach(issue => {
                allIssues.push({
                  category: issue.category || "Design Quality",
                  severity: issue.severity || IssueSeverity.MEDIUM,
                });
              });
            }
          }
        });
      }
    });

    // Group issues by category
    const issueCategories = allIssues.reduce(
      (acc, issue) => {
        const existing = acc.find(cat => cat.category === issue.category);
        if (existing) {
          existing.count++;
        } else {
          acc.push({
            category: issue.category,
            count: 1,
            percentage: 0,
            severity: issue.severity,
          });
        }
        return acc;
      },
      [] as Array<{ category: string; count: number; percentage: number; severity: IssueSeverity }>
    );

    // Calculate percentages
    const totalIssues = issueCategories.reduce((sum, cat) => sum + cat.count, 0);
    issueCategories.forEach(cat => {
      cat.percentage = totalIssues > 0 ? Math.round((cat.count / totalIssues) * 100) : 0;
    });

    // Sort by count and take top 5
    const topIssues = issueCategories.sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      topIssues,
      issueTrends: [], // Would implement daily issue trend analysis
    };
  }

  /**
   * Generate design breakdown data from actual database data
   */
  private generateDesignBreakdown(designReviews: DesignsReview[]) {
    // Calculate actual design breakdown from review data
    const designTypes = new Map<string, { count: number; passed: number }>();
    const deviceTypes = new Map<string, { count: number; percentage: number }>();

    let totalDesigns = 0;

    designReviews.forEach(review => {
      if (review.designs) {
        review.designs.forEach((design: Design) => {
          totalDesigns++;

          // Extract design type from review data or use fallback
          const designType = design.designType || this.extractDesignType(design.figmaUrl) || "Web";
          const deviceType =
            design.deviceType || this.extractDeviceType(design.figmaUrl) || "Desktop";

          // Track design types
          const typeData = designTypes.get(designType) || { count: 0, passed: 0 };
          typeData.count++;

          // Check if design passed
          if (design.reviewJson) {
            const reviewData = design.reviewJson;
            const score = reviewData?.design_score?.total || 0;
            if (score >= this.passRateThreshold) {
              typeData.passed++;
            }
          }
          designTypes.set(designType, typeData);

          // Track device types
          const deviceData = deviceTypes.get(deviceType) || { count: 0, percentage: 0 };
          deviceData.count++;
          deviceTypes.set(deviceType, deviceData);
        });
      }
    });

    // Calculate percentages for device breakdown
    deviceTypes.forEach((data, device) => {
      data.percentage = totalDesigns > 0 ? Math.round((data.count / totalDesigns) * 100) : 0;
    });

    return {
      byType: Array.from(designTypes.entries()).map(([type, data]) => ({
        type,
        count: data.count,
        passRate: data.count > 0 ? Math.round((data.passed / data.count) * 100) : 0,
      })),
      byDevice: Array.from(deviceTypes.entries()).map(([device, data]) => ({
        device,
        count: data.count,
        percentage: data.percentage,
      })),
    };
  }

  /**
   * Extract design type from Figma URL or design data
   */
  private extractDesignType(figmaUrl?: string): string {
    if (!figmaUrl) return "Web";

    const url = figmaUrl.toLowerCase();
    if (url.includes("mobile") || url.includes("app")) return "Mobile";
    if (url.includes("email") || url.includes("newsletter")) return "Email";
    if (url.includes("social") || url.includes("instagram") || url.includes("facebook"))
      return "Social";
    return "Web";
  }

  /**
   * Extract device type from Figma URL or design data
   */
  private extractDeviceType(figmaUrl?: string): string {
    if (!figmaUrl) return "Desktop";

    const url = figmaUrl.toLowerCase();
    if (url.includes("mobile") || url.includes("phone")) return "Mobile";
    if (url.includes("tablet") || url.includes("ipad")) return "Tablet";
    return "Desktop";
  }

  /**
   * Generate brand guideline statistics
   */
  private generateBrandGuidelineStats(brandGuidelines: BrandGuideline[]) {
    return {
      total: brandGuidelines.length,
      completed: brandGuidelines.filter(bg => bg.status === BrandGuidelineStatus.COMPLETED).length,
      processing: brandGuidelines.filter(bg => bg.status === BrandGuidelineStatus.PROCESSING)
        .length,
      failed: brandGuidelines.filter(bg => bg.status === BrandGuidelineStatus.FAILED).length,
      mostUsedRules: brandGuidelines
        .flatMap(bg => bg.brandRules || [])
        .reduce(
          (acc, rule) => {
            const existing = acc.find(r => r.ruleName === rule.name);
            if (existing) {
              existing.usageCount++;
            } else {
              acc.push({
                ruleName: rule.name,
                category: rule.category,
                usageCount: 1,
              });
            }
            return acc;
          },
          [] as Array<{ ruleName: string; category: string; usageCount: number }>
        )
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5),
    };
  }

  /**
   * Generate recent activity data
   */
  private generateRecentActivity(
    designReviews: DesignsReview[],
    brandGuidelines: BrandGuideline[]
  ) {
    const recentActivity = [
      ...designReviews.slice(0, 10).map(review => ({
        id: review.id,
        type: ActivityType.DESIGN_REVIEW,
        title: `Design Review - ${review.name || "Untitled"}`,
        description: `Review ${review.status?.toLowerCase() || "completed"}`,
        status:
          review.status === "COMPLETED"
            ? review.designs &&
              review.designs.some(
                d => d.reviewJson && d.reviewJson?.design_score?.total >= this.passRateThreshold
              )
              ? DashboardStatus.PASSED
              : DashboardStatus.FAILED
            : DashboardStatus.PENDING,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        designType: "Web",
        issueCount: review.designs
          ? review.designs.reduce((total: number, design) => {
              if (design.reviewJson) {
                const reviewData = design.reviewJson;
                return (
                  total +
                  ((reviewData?.brand_issues?.length || 0) +
                    (reviewData?.general_issues?.length || 0))
                );
              }
              return total;
            }, 0)
          : 0,
      })),
      ...brandGuidelines.slice(0, 5).map(guideline => ({
        id: guideline.id,
        type: ActivityType.GUIDELINE_CREATED,
        title: `Brand Guideline - ${guideline.name}`,
        description: `Guideline ${guideline.status.toLowerCase()}`,
        status:
          guideline.status === "COMPLETED"
            ? DashboardStatus.COMPLETED
            : guideline.status === "PROCESSING"
              ? DashboardStatus.PROCESSING
              : DashboardStatus.PENDING,
        createdAt: guideline.createdAt.toISOString(),
        updatedAt: guideline.updatedAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 15);

    return recentActivity;
  }

  /**
   * Generate performance insights based on real data analysis
   */
  private generatePerformanceInsights(designReviews: DesignsReview[], metrics: DashboardMetrics) {
    const allDesigns = designReviews.flatMap(review => review.designs || []);
    const consistencyScores = allDesigns
      .filter(design => design.reviewJson?.design_score)
      .map(design => design.reviewJson.design_score.total);

    // Calculate real average resolution time from timeline data
    const averageResolutionTime = this.calculateAverageResolutionTime(designReviews);

    // Analyze real improvement areas from issue patterns
    const improvementAreas = this.analyzeImprovementAreas(designReviews);

    // Calculate real personal bests
    const personalBest = this.calculatePersonalBests(designReviews, consistencyScores);

    // Calculate real weekly progress
    const weeklyProgress = this.calculateWeeklyProgress(designReviews, metrics);

    return {
      averageResolutionTime,
      improvementAreas,
      personalBest,
      weeklyProgress,
    };
  }

  /**
   * Calculate average resolution time from design timeline data
   */
  private calculateAverageResolutionTime(designReviews: DesignsReview[]): number {
    const resolutionTimes: number[] = [];

    designReviews.forEach(review => {
      if (review.designs) {
        review.designs.forEach(design => {
          if (design.timeline && design.timeline.length > 1) {
            // Calculate time from start to completion
            const startTime = new Date(design.timeline[0].timestamp).getTime();
            const endTime = new Date(
              design.timeline[design.timeline.length - 1].timestamp
            ).getTime();
            const resolutionHours = (endTime - startTime) / (1000 * 60 * 60);

            if (resolutionHours > 0 && resolutionHours < 168) {
              // Filter out unrealistic times (> 1 week)
              resolutionTimes.push(resolutionHours);
            }
          }
        });
      }
    });

    return resolutionTimes.length > 0
      ? Math.round(
          (resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length) * 10
        ) / 10
      : 0;
  }

  /**
   * Analyze real improvement areas from issue patterns
   */
  private analyzeImprovementAreas(designReviews: DesignsReview[]) {
    const issueCategories = new Map<string, { count: number; severity: string[] }>();

    designReviews.forEach(review => {
      if (review.designs) {
        review.designs.forEach(design => {
          if (design.reviewJson) {
            // Analyze brand issues
            if (design.reviewJson.brand_issues) {
              design.reviewJson.brand_issues.forEach((issue: BrandIssue) => {
                const category = issue.category || "Design Quality";
                const existing = issueCategories.get(category) || { count: 0, severity: [] };
                existing.count++;
                existing.severity.push(issue.severity || "MEDIUM");
                issueCategories.set(category, existing);
              });
            }

            // Analyze general issues
            if (design.reviewJson.general_issues) {
              design.reviewJson.general_issues.forEach((issue: GeneralIssue) => {
                const category = issue.category || "Design Quality";
                const existing = issueCategories.get(category) || { count: 0, severity: [] };
                existing.count++;
                existing.severity.push(issue.severity || "MEDIUM");
                issueCategories.set(category, existing);
              });
            }
          }
        });
      }
    });

    // Convert to improvement areas with real suggestions
    const improvementAreas = Array.from(issueCategories.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 3)
      .map(([category, data]) => {
        const highSeverityCount = data.severity.filter(s => s === IssueSeverity.HIGH).length;
        const impact =
          highSeverityCount > data.count * 0.3
            ? ImpactLevel.HIGH
            : highSeverityCount > 0
              ? ImpactLevel.MEDIUM
              : ImpactLevel.LOW;

        return {
          category,
          suggestion: this.generateSuggestion(category, data.count),
          impact,
        };
      });

    // If no issues found, return generic improvement areas
    if (improvementAreas.length === 0) {
      return [
        {
          category: "Design Consistency",
          suggestion: "Continue maintaining high design standards",
          impact: ImpactLevel.LOW,
        },
      ];
    }

    return improvementAreas;
  }

  /**
   * Generate contextual suggestions based on issue category
   */
  private generateSuggestion(category: string, count: number): string {
    const suggestions: Record<string, string[]> = {
      "Color Consistency": [
        "Review brand color guidelines more frequently",
        "Create a color palette reference for quick access",
        "Use design tokens to maintain color consistency",
      ],
      Typography: [
        "Ensure font consistency across all designs",
        "Create typography guidelines with clear hierarchy",
        "Use consistent font weights and sizes",
      ],
      Spacing: [
        "Implement consistent spacing patterns",
        "Use a spacing scale for layout consistency",
        "Review padding and margin guidelines",
      ],
      "Logo Placement": [
        "Follow logo placement guidelines strictly",
        "Ensure proper logo clear space is maintained",
        "Use approved logo variants consistently",
      ],
      "Brand Compliance": [
        "Review brand guidelines before starting designs",
        "Implement brand compliance checklist",
        "Regular training on brand standards",
      ],
      "Design Quality": [
        "Improve overall design execution quality",
        "Focus on attention to detail in designs",
        "Regular design reviews and feedback sessions",
      ],
    };

    console.log(category);

    const categoryKey =
      Object.keys(suggestions).find(key => category.toLowerCase().includes(key.toLowerCase())) ||
      "Design Quality";

    const suggestionList = suggestions[categoryKey];
    const intensity = count > 10 ? 0 : count > 5 ? 1 : 2;

    return suggestionList[Math.min(intensity, suggestionList.length - 1)];
  }

  /**
   * Calculate real personal bests from historical data
   */
  private calculatePersonalBests(designReviews: DesignsReview[], consistencyScores: number[]) {
    // Calculate highest consistency score
    const highestConsistencyScore =
      consistencyScores.length > 0 ? Math.max(...consistencyScores) : 0;

    // Calculate longest pass streak
    const longestPassStreak = this.calculateLongestPassStreak(designReviews);

    // Calculate fastest resolution time
    const fastestResolution = this.calculateFastestResolution(designReviews);

    return {
      highestConsistencyScore,
      longestPassStreak,
      fastestResolution,
    };
  }

  /**
   * Calculate longest streak of passing reviews
   */
  private calculateLongestPassStreak(designReviews: DesignsReview[]): number {
    const sortedReviews = [...designReviews].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;

    sortedReviews.forEach(review => {
      const reviewPassed =
        review.designs &&
        review.designs.some(
          design => design.reviewJson?.design_score?.total >= this.passRateThreshold
        );

      if (reviewPassed) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return longestStreak;
  }

  /**
   * Calculate fastest resolution time
   */
  private calculateFastestResolution(designReviews: DesignsReview[]): number {
    let fastestTime = Infinity;

    designReviews.forEach(review => {
      if (review.designs) {
        review.designs.forEach(design => {
          if (design.timeline && design.timeline.length > 1) {
            const startTime = new Date(design.timeline[0].timestamp).getTime();
            const endTime = new Date(
              design.timeline[design.timeline.length - 1].timestamp
            ).getTime();
            const resolutionHours = (endTime - startTime) / (1000 * 60 * 60);

            if (resolutionHours > 0 && resolutionHours < 48) {
              // Filter realistic times
              fastestTime = Math.min(fastestTime, resolutionHours);
            }
          }
        });
      }
    });

    return fastestTime === Infinity ? 0 : Math.round(fastestTime * 10) / 10;
  }

  /**
   * Calculate real weekly progress comparison
   */
  private calculateWeeklyProgress(designReviews: DesignsReview[], metrics: DashboardMetrics) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // This week's data
    const thisWeekReviews = designReviews.filter(review => review.createdAt >= oneWeekAgo);
    const thisWeekDesigns = thisWeekReviews.flatMap(review => review.designs || []);
    const thisWeekPassed = thisWeekDesigns.filter(
      design => design.reviewJson?.design_score?.total >= this.passRateThreshold
    ).length;
    const thisWeekScores = thisWeekDesigns
      .filter(design => design.reviewJson?.design_score)
      .map(design => design.reviewJson.design_score.total);

    // Last week's data
    const lastWeekReviews = designReviews.filter(
      review => review.createdAt >= twoWeeksAgo && review.createdAt < oneWeekAgo
    );
    const lastWeekDesigns = lastWeekReviews.flatMap(review => review.designs || []);
    const lastWeekPassed = lastWeekDesigns.filter(
      design => design.reviewJson?.design_score?.total >= this.passRateThreshold
    ).length;
    const lastWeekScores = lastWeekDesigns
      .filter(design => design.reviewJson?.design_score)
      .map(design => design.reviewJson.design_score.total);

    return {
      thisWeek: {
        reviews: thisWeekReviews.length,
        passRate: this.calculatePassRate(thisWeekPassed, thisWeekDesigns.length),
        avgScore: this.calculateAverageScore(thisWeekScores),
      },
      lastWeek: {
        reviews: lastWeekReviews.length,
        passRate: this.calculatePassRate(lastWeekPassed, lastWeekDesigns.length),
        avgScore: this.calculateAverageScore(lastWeekScores),
      },
    };
  }

  /**
   * Helper method to convert period enum to actual date range
   */
  getDateRangeFromPeriod(period: DatePeriod): DateRange {
    const end = new Date().toISOString();
    const start = new Date();

    switch (period) {
      case DatePeriod.SEVEN_DAYS:
        start.setDate(start.getDate() - 7);
        break;
      case DatePeriod.THIRTY_DAYS:
        start.setDate(start.getDate() - 30);
        break;
      case DatePeriod.NINETY_DAYS:
        start.setDate(start.getDate() - 90);
        break;
      case DatePeriod.ONE_YEAR:
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return {
      start: start.toISOString(),
      end,
      period,
    };
  }

  /**
   * Calculate growth percentage
   */
  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Calculate pass rate with proper handling of edge cases
   */
  calculatePassRate(passed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((passed / total) * 100);
  }

  /**
   * Calculate average score from array of scores
   */
  calculateAverageScore(scores: number[]): number {
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }
}

export const dashboardService = new DashboardService();
