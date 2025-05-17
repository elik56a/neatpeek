import * as React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/utils/cn";
import { SortDirection } from "@/types/enums";

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sort?: {
    field: string;
    direction: SortDirection;
  };
  onSort?: (field: string) => void;
  className?: string;
  rowClassName?: string;
  isLoading?: boolean;
  loadingRows?: number;
  noDataMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  sort,
  onSort,
  className,
  rowClassName,
  isLoading,
  loadingRows = 5,
  noDataMessage = "No data available",
}: DataTableProps<T>) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map(column => (
            <TableHead
              key={column.key}
              className={cn(
                column.sortable && "cursor-pointer select-none group hover:bg-muted/60",
                "transition-colors duration-200",
                column.className
              )}
              onClick={() => {
                if (column.sortable && onSort) {
                  onSort(column.key);
                }
              }}
            >
              <div className="flex items-center gap-1">
                {column.header}
                {column.sortable && (
                  <span
                    className={cn(
                      "text-muted-foreground transition-opacity duration-200",
                      sort?.field === column.key
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {sort?.field === column.key ? (
                      sort.direction === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    )}
                  </span>
                )}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: loadingRows }).map((_, index) => (
            <TableRow key={index}>
              {columns.map(column => (
                <TableCell key={column.key}>
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              {noDataMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => (
            <TableRow key={index} className={rowClassName}>
              {columns.map(column => (
                <TableCell key={column.key} className={column.className}>
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
