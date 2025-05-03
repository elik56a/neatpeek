"use client";

import { AreaChart as Area } from "@tremor/react";
import { BarChart as Bar } from "@tremor/react";
import { LineChart as Line } from "@tremor/react";
import { DonutChart as Pie } from "@tremor/react";

export interface ChartProps {
  className?: string;
  data: any[];
  categories?: string[];
  index?: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showAnimation?: boolean;
  showLegend?: boolean;
  showGridLines?: boolean;
  yAxisWidth?: number;
  stack?: boolean;
  layout?: "vertical" | "horizontal";
  [key: string]: any;
}

export function AreaChart({
  data,
  categories,
  className,
  index = "date",
  colors,
  valueFormatter,
  showAnimation = true,
  showLegend = true,
  showGridLines = true,
  yAxisWidth = 60,
  stack = false,
  ...props
}: ChartProps) {
  return (
    <Area
      data={data}
      index={index}
      categories={categories || []}
      colors={colors || ["blue", "cyan", "indigo"]}
      valueFormatter={valueFormatter}
      showAnimation={showAnimation}
      showLegend={showLegend}
      showGridLines={showGridLines}
      yAxisWidth={yAxisWidth}
      stack={stack}
      className={className}
      {...props}
    />
  );
}

export function BarChart({
  data,
  categories,
  className,
  index = "date",
  colors,
  valueFormatter,
  showAnimation = true,
  showLegend = true,
  showGridLines = true,
  yAxisWidth = 60,
  stack = false,
  layout = "horizontal",
  ...props
}: ChartProps) {
  return (
    <Bar
      data={data}
      index={index}
      categories={categories || []}
      colors={colors || ["blue", "cyan", "indigo"]}
      valueFormatter={valueFormatter}
      showAnimation={showAnimation}
      showLegend={showLegend}
      showGridLines={showGridLines}
      yAxisWidth={yAxisWidth}
      stack={stack}
      layout={layout}
      className={className}
      {...props}
    />
  );
}

export function LineChart({
  data,
  categories,
  className,
  index = "date",
  colors,
  valueFormatter,
  showAnimation = true,
  showLegend = true,
  showGridLines = true,
  yAxisWidth = 60,
  ...props
}: ChartProps) {
  return (
    <Line
      data={data}
      index={index}
      categories={categories || []}
      colors={colors || ["blue", "cyan", "indigo"]}
      valueFormatter={valueFormatter}
      showAnimation={showAnimation}
      showLegend={showLegend}
      showGridLines={showGridLines}
      yAxisWidth={yAxisWidth}
      className={className}
      {...props}
    />
  );
}

export function PieChart({
  data,
  category,
  className,
  index = "name",
  colors,
  valueFormatter,
  showAnimation = true,
  ...props
}: ChartProps) {
  return (
    <Pie
      data={data}
      index={index}
      category={category || ""}
      colors={colors || ["blue", "cyan", "indigo"]}
      valueFormatter={valueFormatter}
      showAnimation={showAnimation}
      className={className}
      {...props}
    />
  );
}
