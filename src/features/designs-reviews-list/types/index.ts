import type { DesignsReview } from "@/types";
import { IdAndName } from "@/types/general";
import { SortDirection } from "@/types/enums";
import { ReviewStatus } from "@/features/design-review/types";
import { DesignsReviewSortField } from "./enums";
import { CustomDropdownOption } from "@/types/general";

export { DesignsReviewSortField, ViewMode } from "./enums";
export * from "./view-models";

export interface DesignsReviewsListParams {
  cursor?: string;
  take?: number;
  userId?: string;
  status?: ReviewStatus;
  searchQuery?: string;
  orderBy?: {
    field: DesignsReviewSortField;
    direction: SortDirection;
  };
}

export interface DesignsReviewsListResponse {
  items: Partial<DesignsReview>[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface DesignsReviewListViewModel {
  items: DesignsReviewListItemViewModel[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface DesignsReviewListItemViewModel {
  id: string;
  name: string;
  brandGuideline: IdAndName;
  createdAt: Date;
  status: ReviewStatus;
  issues: {
    brand: number;
    general: number;
    total: number;
  };
  scores: {
    total: number;
    brand?: number;
    visualHarmony?: number;
    usability?: number;
    accessibility?: number;
  };
  previewImage?: string | null;
  figmaUrl: string;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface DesignsReviewListFilterState {
  searchQuery: string;
  status?: ReviewStatus;
}

export interface DesignsReviewListSortState {
  field: DesignsReviewSortField;
  direction: SortDirection;
}

export const SORTABLE_FIELDS_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "brandGuideline", label: "Brand Guideline" },
  { value: "createdAt", label: "Date" },
  { value: "updatedAt", label: "Updated At" },
  { value: "status", label: "Status" },
  { value: "score", label: "Score" },
  { value: "issuesCount", label: "Issues" },
] as const;

export type SortableField = (typeof SORTABLE_FIELDS_OPTIONS)[number]["value"];

export interface FilterConfig {
  searchQuery?: string;
  brandGuidelineId?: string;
  status?: ReviewStatus;
}

export interface QueryParams {
  cursor?: string;
  take?: number;
  sortField?: SortableField;
  sortDirection?: SortDirection;
  searchQuery?: string;
  brandGuidelineId?: string;
  status?: ReviewStatus;
}

export const FILTERABLE_FIELDS = ["searchQuery", "status"] as const;

export const FILTERABLE_STATUS_OPTIONS: CustomDropdownOption[] = [
  { value: ReviewStatus.PENDING, label: "Pending" },
  { value: ReviewStatus.IN_PROGRESS, label: "In Progress" },
  { value: ReviewStatus.COMPLETED, label: "Completed" },
  { value: ReviewStatus.FAILED, label: "Failed" },
];
