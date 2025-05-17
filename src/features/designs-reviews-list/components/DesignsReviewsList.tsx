"use client";

import { Button } from "@/components/ui/button";
import { useDesignsReviewsList } from "../hooks/useDesignsReviewsList";
import { LoadingState } from "./LoadingState";
import { TableView } from "./TableView";
import { GridView } from "./GridView";
import { ToolbarSection } from "./ToolbarSection";
import { Card } from "@/components/ui/card";
import { ViewMode } from "../types/enums";

export default function DesignsReviewsList() {
  const {
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
    onItemClick,
  } = useDesignsReviewsList();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold mb-2">Error Loading Designs Reviews</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={resetFilterAndSort}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <ToolbarSection
        filter={filter}
        viewMode={viewMode}
        sort={sort}
        onFilterChange={updateFilter}
        onViewModeToggle={toggleViewMode}
        onSortChange={updateSort}
      />

      {isLoading && items.length === 0 ? (
        <LoadingState viewMode={viewMode} />
      ) : viewMode === ViewMode.TABLE ? (
        <Card>
          <TableView
            items={items}
            sort={sort}
            onItemClick={onItemClick}
            onSortChange={updateSort}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </Card>
      ) : (
        <GridView
          items={items}
          onItemClick={onItemClick}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      )}
    </div>
  );
}
