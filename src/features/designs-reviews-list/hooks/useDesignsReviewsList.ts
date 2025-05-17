import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DesignsReviewListItemViewModel,
  DesignsReviewListViewModel,
  DesignsReviewListFilterState,
  DesignsReviewListSortState,
  ViewMode,
  QueryParams,
} from "../types";
import { DesignsReviewSortField } from "../types/enums";
import { SortDirection } from "@/types/enums";

interface UseDesignsReviewsListParams {
  initialData?: DesignsReviewListViewModel;
  pageSize?: number;
}

export function useDesignsReviewsList({
  initialData,
  pageSize = 10,
}: UseDesignsReviewsListParams = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data state
  const [items, setItems] = useState<DesignsReviewListItemViewModel[]>(initialData?.items ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(initialData?.hasMore ?? true);
  const [cursor, setCursor] = useState<string | null>(initialData?.nextCursor ?? null);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const urlViewMode = searchParams?.get("view");
    return urlViewMode === "grid" ? ViewMode.GRID : ViewMode.TABLE;
  });

  const [filter, setFilter] = useState<DesignsReviewListFilterState>({
    searchQuery: searchParams?.get("search") || "",
    status: (searchParams?.get("status") as any) || undefined,
  });

  const [sort, setSort] = useState<DesignsReviewListSortState>({
    field:
      (searchParams?.get("sortField") as DesignsReviewSortField) ||
      DesignsReviewSortField.CREATED_AT,
    direction: (searchParams?.get("sortDirection") as SortDirection) || SortDirection.DESC,
  });

  // Debounce search query
  const debouncedSearchQuery = useDebounce(filter.searchQuery, 300);

  // Build query params for API call and URL update
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    // Add pagination params
    if (cursor) {
      params.append("cursor", cursor);
    }
    params.append("take", String(pageSize));

    // Add sort params
    if (sort.field) {
      params.append("sortField", sort.field);
      params.append("sortDirection", sort.direction);
    }

    // Add search and filter params
    if (debouncedSearchQuery.trim()) {
      params.append("searchQuery", debouncedSearchQuery.trim());
    }
    if (filter.status) {
      params.append("status", filter.status);
    }

    // Add view mode
    params.append("view", viewMode.toLowerCase());

    return params;
  }, [cursor, pageSize, sort, debouncedSearchQuery, filter.status, viewMode]);

  // Fetch data and update URL
  const fetchData = useCallback(
    async (reset = false) => {
      try {
        setIsLoading(true);
        setError(null);

        if (reset) {
          setCursor(null);
        }

        // Update URL first
        const queryParams = buildQueryParams();
        if (typeof window !== "undefined") {
          router.replace(`${window.location.pathname}?${queryParams.toString()}`);
        }

        // Remove pagination params for API call if resetting
        if (reset) {
          queryParams.delete("cursor");
        }

        const response = await fetch(`/api/designs-reviews?${queryParams}`);
        if (!response.ok) throw new Error("Failed to fetch designs reviews");

        const data: DesignsReviewListViewModel = await response.json();
        setItems(prevItems => (reset ? data.items : [...prevItems, ...data.items]));
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [buildQueryParams, router]
  );

  // Single effect to handle all data fetching
  useEffect(() => {
    if (!initialData) {
      fetchData(true);
    }
  }, [debouncedSearchQuery, sort.field, sort.direction, filter.status, viewMode]);

  // UI update handlers
  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === ViewMode.TABLE ? ViewMode.GRID : ViewMode.TABLE;
    setViewMode(newMode);
  }, [viewMode]);

  const updateFilter = useCallback((newFilter: Partial<DesignsReviewListFilterState>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const updateSort = useCallback((newSort: DesignsReviewListSortState) => {
    setSort(newSort);
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchData(false);
    }
  }, [fetchData, isLoading, hasMore]);

  const resetFilterAndSort = useCallback(() => {
    setFilter({
      searchQuery: "",
      status: undefined,
    });
    setSort({
      field: DesignsReviewSortField.CREATED_AT,
      direction: SortDirection.DESC,
    });
  }, [fetchData]);

  return {
    items,
    isLoading,
    error,
    hasMore,
    viewMode,
    filter,
    sort,
    resetFilterAndSort,
    loadMore,
    updateFilter,
    updateSort,
    toggleViewMode,
    onItemClick: useCallback(
      (id: string) => {
        router.push(`/design-review/${id}`);
      },
      [router]
    ),
  };
}
