import { SortDirection } from "@/types/enums";

export interface SortConfig<T> {
  field: keyof T;
  direction: SortDirection;
}

export type SortableField<T> = {
  [K in keyof T]: T[K] extends string | number | Date | boolean ? K : never;
}[keyof T];

/**
 * Generic sorting function for arrays of objects
 */
export function sortItems<T extends Record<string, any>>(
  items: T[],
  config: SortConfig<T>,
  options: {
    // For fields that need custom comparison logic
    customSort?: {
      [K in keyof T]?: (a: T[K], b: T[K]) => number;
    };
    // For calculated fields that need preprocessing
    calculateField?: {
      [K in keyof T]?: (item: T) => number | string | Date;
    };
  } = {}
): T[] {
  return [...items].sort((a, b) => {
    const { field, direction } = config;

    // If there's a custom sort function for this field, use it
    if (options.customSort?.[field]) {
      const result = options.customSort[field]!(a[field], b[field]);
      return direction === SortDirection.ASC ? result : -result;
    }

    // If there's a field calculator, use it
    if (options.calculateField?.[field]) {
      const aValue = options.calculateField[field]!(a);
      const bValue = options.calculateField[field]!(b);

      if (aValue < bValue) return direction === SortDirection.ASC ? -1 : 1;
      if (aValue > bValue) return direction === SortDirection.ASC ? 1 : -1;
      return 0;
    }

    // Default sorting logic
    const aValue = a[field];
    const bValue = b[field];

    if (aValue < bValue) return direction === SortDirection.ASC ? -1 : 1;
    if (aValue > bValue) return direction === SortDirection.ASC ? 1 : -1;
    return 0;
  });
}

/**
 * Format a number to a fixed number of decimal places and handle edge cases
 */
export function formatNumber(value: number, decimals: number = 1): number {
  return Number(Number(value).toFixed(decimals));
}
