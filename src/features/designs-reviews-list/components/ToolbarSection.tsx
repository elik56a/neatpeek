import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Grid, List, Search, ArrowUpDown, X } from "lucide-react";
import { ViewMode } from "../types/enums";
import { ReviewStatus } from "@/features/design-review/types";
import {
  DesignsReviewListFilterState,
  DesignsReviewListSortState,
  FILTERABLE_STATUS_OPTIONS,
  SORTABLE_FIELDS_OPTIONS,
} from "../types";
import { DesignsReviewSortField } from "../types/enums";
import { SortDirection } from "@/types/enums";
import { useState } from "react";
import { CustomDropdown } from "@/components/ui/custom-dropdown";

interface ToolbarSectionProps {
  filter: DesignsReviewListFilterState;
  viewMode: ViewMode;
  sort: DesignsReviewListSortState;
  onFilterChange: (filter: Partial<DesignsReviewListFilterState>) => void;
  onViewModeToggle: () => void;
  onSortChange: (sort: DesignsReviewListSortState) => void;
}

export function ToolbarSection({
  filter,
  viewMode,
  sort,
  onFilterChange,
  onViewModeToggle,
  onSortChange,
}: ToolbarSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Design Reviews List</h1>
        <p className="text-muted-foreground">View your design reviews</p>
      </div>
      <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative w-full sm:w-[260px] md:w-[320px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search designs..."
            className="pl-8 pr-8 w-full sm:w-[260px] md:w-[320px] min-w-0"
            value={filter.searchQuery}
            onChange={e => onFilterChange({ searchQuery: e.target.value })}
          />
          {filter.searchQuery && (
            <button
              type="button"
              className="absolute right-2.5 top-2.5 p-1 rounded-full bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              style={{ lineHeight: 0 }}
              onClick={() => onFilterChange({ searchQuery: "" })}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative w-full sm:w-[200px] md:w-[220px] flex items-center">
          <CustomDropdown
            label="Filter"
            icon={<Filter className="h-4 w-4" />}
            selected={
              filter.status
                ? (FILTERABLE_STATUS_OPTIONS.find(option => option.value === filter.status) ?? null)
                : null
            }
            options={FILTERABLE_STATUS_OPTIONS as unknown as DropdownOption[]}
            onSelect={option => onFilterChange({ status: option.value as ReviewStatus })}
            placeholder="Filter"
            className="w-full sm:w-[200px] md:w-[220px]"
            contentClassName="relative w-full sm:w-[200px] md:w-[220px]"
          />
          {filter.status && (
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-muted hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors z-10 pointer-events-auto"
              style={{ lineHeight: 0 }}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onFilterChange({ status: undefined });
              }}
              aria-label="Clear status filter"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <CustomDropdown
          label="Sort"
          icon={<ArrowUpDown className="h-4 w-4" />}
          selected={(() => {
            const selected = SORTABLE_FIELDS_OPTIONS.find(option => option.value === sort.field);
            return selected ?? null;
          })()}
          options={SORTABLE_FIELDS_OPTIONS as unknown as DropdownOption[]}
          onSelect={option =>
            onSortChange({
              field: option.value as DesignsReviewSortField,
              direction:
                sort.field === (option.value as DesignsReviewSortField) &&
                sort.direction === SortDirection.ASC
                  ? SortDirection.DESC
                  : SortDirection.ASC,
            })
          }
          placeholder="Sort"
          className="w-full sm:w-[160px] md:w-[180px]"
          contentClassName="relative w-full sm:w-[160px] md:w-[180px]"
        />

        <div className="flex items-center border rounded-md overflow-hidden w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onViewModeToggle}
            className={viewMode === ViewMode.TABLE ? "bg-muted" : ""}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">Table view</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onViewModeToggle}
            className={viewMode === ViewMode.GRID ? "bg-muted" : ""}
          >
            <Grid className="h-4 w-4" />
            <span className="sr-only">Grid view</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
