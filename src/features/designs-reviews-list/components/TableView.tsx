import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ShieldAlert, AlertCircle } from "lucide-react";
import { ReviewStatus } from "@/features/design-review/types";
import { DesignsReviewListItemViewModel, DesignsReviewListSortState } from "../types";
import { DesignsReviewSortField } from "../types/enums";
import Link from "next/link";
import { SortDirection } from "@/types/enums";
import { useMemo } from "react";
import {
  getReviewStatusBadgeVariant,
  getReviewStatusColor,
  getReviewStatusLabel,
  getScoreColor,
} from "@/features/design-review/utils/enum-mappers";
import { ActionMenu } from "./ActionMenu";

interface TableViewProps {
  items: DesignsReviewListItemViewModel[];
  sort: DesignsReviewListSortState;
  onItemClick: (id: string) => void;
  onSortChange: (field: DesignsReviewListSortState) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function TableView({
  items,
  sort,
  onItemClick,
  onSortChange,
  isLoading,
  hasMore,
  onLoadMore,
}: TableViewProps) {
  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        sortable: true,
        cell: (item: DesignsReviewListItemViewModel) => item.name,
      },
      {
        key: "brandGuideline",
        header: "Brand Guideline",
        sortable: true,
        cell: (item: DesignsReviewListItemViewModel) => (
          <Button variant="link" size="sm" asChild>
            <Link href={`/brand-setup/${item.brandGuideline.id}`}>{item.brandGuideline.name}</Link>
          </Button>
        ),
      },
      {
        key: "createdAt",
        header: "Date",
        sortable: true,
        cell: (item: DesignsReviewListItemViewModel) =>
          format(new Date(item.createdAt), "MMM d, yyyy"),
      },
      {
        key: "score",
        header: "Score",
        sortable: true,
        className: "hidden sm:table-cell",
        cell: (item: DesignsReviewListItemViewModel) => (
          <Badge className={getScoreColor(item.scores.total)}>{item.scores.total}%</Badge>
        ),
      },
      {
        key: "issuesCount",
        header: "Issues",
        sortable: true,
        className: "hidden md:table-cell",
        cell: (item: DesignsReviewListItemViewModel) => (
          <div className="flex flex-col gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="w-24 justify-between">
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3 text-primary" />
                      Brand
                    </span>
                    <span>{item.issues.brand}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Brand-related issues</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="w-24 justify-between">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-blue-500" />
                      General
                    </span>
                    <span>{item.issues.general}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>General design issues</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        cell: (item: DesignsReviewListItemViewModel) => (
          <Badge variant={getReviewStatusBadgeVariant(item.status)}>
            {getReviewStatusLabel(item.status)}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        className: "w-[100px] hidden md:table-cell",
        cell: (item: DesignsReviewListItemViewModel) => (
          <ActionMenu figmaUrl={item.figmaUrl} reviewId={item.id} />
        ),
      },
    ],
    []
  );

  const handleSort = (field: string) => {
    onSortChange({
      field: field as DesignsReviewSortField,
      direction:
        sort.field === field && sort.direction === SortDirection.DESC
          ? SortDirection.ASC
          : SortDirection.DESC,
    });
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <DataTable
        data={items}
        columns={columns}
        sort={sort}
        onSort={handleSort}
        isLoading={isLoading}
        rowClassName="cursor-pointer hover:bg-muted/50"
        noDataMessage="No design reviews found"
      />
      {!isLoading && hasMore && onLoadMore && (
        <div className="flex justify-center border-t p-4">
          <Button variant="outline" onClick={onLoadMore}>
            Load More
          </Button>
        </div>
      )}
      <div className="sm:hidden text-xs text-muted-foreground text-center py-2">
        Swipe to see more columns
      </div>
    </div>
  );
}
