import { ReviewStatus } from "@prisma/client";
import { SortDirection } from "@/types/enums";
import { DesignsReviewSortField } from "./enums";
import { DesignsReviewListItemViewModel } from ".";

export interface DesignsReviewListViewModel {
  items: DesignsReviewListItemViewModel[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface DesignsReviewListFilterState {
  searchQuery: string;
  brandGuidelineId?: string;
  status?: ReviewStatus;
}

export interface DesignsReviewListSortState {
  field: DesignsReviewSortField;
  direction: SortDirection;
}

export type ViewMode = "table" | "grid";
