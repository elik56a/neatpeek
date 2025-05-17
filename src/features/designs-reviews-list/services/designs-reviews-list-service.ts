import { prisma } from "@/services/db/prisma";
import { SortDirection } from "@/types/enums";
import {
  DesignsReviewListViewModel,
  DesignsReviewsListParams,
  DesignsReviewSortField,
} from "../types";
import { sortItems, formatNumber } from "@/utils/server/sort";
import { ReviewJson } from "@/features/design-review/types";

/**
 * Service for handling DesignsReviews list operations
 * This service is server-side only
 */
export class DesignsReviewsListService {
  private static instance: DesignsReviewsListService;

  private constructor() {}

  public static getInstance(): DesignsReviewsListService {
    if (!DesignsReviewsListService.instance) {
      DesignsReviewsListService.instance = new DesignsReviewsListService();
    }
    return DesignsReviewsListService.instance;
  }

  private calculateTotalScore(designs: { reviewJson: ReviewJson }[]): number {
    if (designs.length === 0) return 0;
    const totalScore = designs.reduce(
      (acc, design) => acc + design.reviewJson.design_score.total,
      0
    );
    return formatNumber(totalScore / designs.length);
  }

  private calculateBrandScore(designs: { reviewJson: ReviewJson }[]): number {
    if (designs.length === 0) return 0;
    const totalScore = designs.reduce(
      (acc, design) => acc + design.reviewJson.design_score.breakdown.brand_compliance,
      0
    );
    return formatNumber(totalScore / designs.length);
  }

  private calculateVisualHarmonyScore(designs: { reviewJson: ReviewJson }[]): number {
    if (designs.length === 0) return 0;
    const totalScore = designs.reduce(
      (acc, design) => acc + design.reviewJson.design_score.breakdown.visual_harmony,
      0
    );
    return formatNumber(totalScore / designs.length);
  }

  private calculateUsabilityScore(designs: { reviewJson: ReviewJson }[]): number {
    if (designs.length === 0) return 0;
    const totalScore = designs.reduce(
      (acc, design) => acc + design.reviewJson.design_score.breakdown.usability,
      0
    );
    return formatNumber(totalScore / designs.length);
  }

  private calculateAccessibilityScore(designs: { reviewJson: ReviewJson }[]): number {
    if (designs.length === 0) return 0;
    const totalScore = designs.reduce(
      (acc, design) => acc + design.reviewJson.design_score.breakdown.accessibility,
      0
    );
    return formatNumber(totalScore / designs.length);
  }

  private calculateIssuesCount(
    designs: { reviewJson: ReviewJson }[],
    type: "brand" | "general"
  ): number {
    return designs.reduce(
      (acc, design) =>
        acc + design.reviewJson[type === "brand" ? "brand_issues" : "general_issues"].length,
      0
    );
  }

  private isCalculatedField(field: string): boolean {
    return ["score", "brandIssuesCount", "generalIssuesCount", "issuesCount"].includes(field);
  }

  private isDirectlySortable(field: string): boolean {
    return ["name", "createdAt", "status"].includes(field);
  }

  /**
   * Get a paginated list of designs reviews
   */
  async getDesignsReviews({
    cursor,
    take = 10,
    userId,
    status,
    searchQuery,
    orderBy = { field: DesignsReviewSortField.CREATED_AT, direction: SortDirection.DESC },
  }: DesignsReviewsListParams): Promise<DesignsReviewListViewModel> {
    // Determine if we need to fetch all items for sorting
    const shouldFetchAll = this.isCalculatedField(orderBy.field);

    const items = await prisma.designsReview.findMany({
      take: shouldFetchAll ? undefined : take + 1,
      skip: shouldFetchAll ? undefined : cursor ? 1 : 0,
      cursor: shouldFetchAll ? undefined : cursor ? { id: cursor } : undefined,
      where: {
        ...(userId && { userId }),
        ...(status && { status }),
        ...(searchQuery && {
          name: {
            contains: searchQuery,
            mode: "insensitive",
          },
        }),
      },
      orderBy: this.isDirectlySortable(orderBy.field)
        ? {
            [orderBy.field]: orderBy.direction,
          }
        : undefined,
      include: {
        designs: {
          select: {
            reviewJson: true,
          },
        },
        brandGuideline: {
          select: {
            name: true,
            id: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Transform items and calculate fields
    const transformedItems = items.map(item => {
      const brandIssuesCount = this.calculateIssuesCount(item.designs, "brand");
      const generalIssuesCount = this.calculateIssuesCount(item.designs, "general");

      return {
        id: item.id,
        name: item.name,
        createdAt: item.createdAt,
        brandGuideline: item.brandGuideline,
        scores: {
          total: this.calculateTotalScore(item.designs),
          // brand: this.calculateBrandScore(item.designs),
          // visualHarmony: this.calculateVisualHarmonyScore(item.designs),
          // usability: this.calculateUsabilityScore(item.designs),
          // accessibility: this.calculateAccessibilityScore(item.designs),
        },
        issues: {
          brand: brandIssuesCount,
          general: generalIssuesCount,
          total: brandIssuesCount + generalIssuesCount,
        },
        designsImagesUrl: item.designs.map(design => (design.reviewJson as any).image.url),
        status: item.status,
        figmaUrl: item.figmaUrl ?? "",
        previewImage: item.designs[0] ? (item.designs[0].reviewJson as any).image.url : null,
        user: {
          name: item.user.name,
          email: item.user.email,
          image: item.user.image,
        },
      };
    });

    // Sort items if needed
    let sortedItems = transformedItems;
    if (this.isCalculatedField(orderBy.field)) {
      sortedItems = sortItems(
        transformedItems,
        { field: orderBy.field as any, direction: orderBy.direction },
        {
          calculateField: {
            score: item => item.score,
            brandIssuesCount: item => item.brandIssuesCount,
            generalIssuesCount: item => item.generalIssuesCount,
            issuesCount: item => item.issuesCount,
          },
        }
      );

      // Apply pagination after sorting
      if (cursor) {
        const cursorIndex = sortedItems.findIndex(item => item.id === cursor);
        if (cursorIndex !== -1) {
          sortedItems = sortedItems.slice(cursorIndex + 1);
        }
      }
      sortedItems = sortedItems.slice(0, take + 1);
    }

    // Check if we have more items
    const hasMore = sortedItems.length > take;
    const actualItems = hasMore ? sortedItems.slice(0, -1) : sortedItems;
    const nextCursor = hasMore ? actualItems[actualItems.length - 1].id : null;

    return {
      items: actualItems,
      nextCursor,
      hasMore,
    };
  }
}
