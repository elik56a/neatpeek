"use client";

import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  category?: string; // For PieChart
  [key: string]: any;
}

// Your brand colors
const DEFAULT_COLORS = [
  "#8344FF", // Your primary brand color
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#14b8a6", // Teal
];

// Format chart labels properly
function formatChartLabel(key: string): string {
  const labelMap: Record<string, string> = {
    reviews: "Reviews",
    passRate: "Pass Rate",
    consistencyScore: "Consistency Score",
    totalReviews: "Total Reviews",
    passingRate: "Passing Rate",
    brandConsistencyScore: "Brand Consistency",
    activeReviews: "Active Reviews",
    desktop: "Desktop",
    mobile: "Mobile",
    tablet: "Tablet",
    web: "Web",
    email: "Email",
    social: "Social",
    count: "Count",
    percentage: "Percentage",
    value: "Value",
    name: "Name",
    type: "Type",
    device: "Device",
  };

  if (labelMap[key]) {
    return labelMap[key];
  }

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, " ")
    .trim();
}

// Format dates for X-axis
function formatXAxisDate(date: string): string {
  const dateObj = new Date(date);

  // Check if it's a valid date
  if (isNaN(dateObj.getTime())) {
    return date; // Return as-is if not a valid date
  }

  const now = new Date();
  const diffDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return dateObj.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue
  if (diffDays < 30) return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // Jan 15
  return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }); // Jan 15
}

// Check if a value is a date string
function isDateString(value: string): boolean {
  // Check common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{4}-\d{2}-\d{2}T/, // ISO date
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
  ];

  return datePatterns.some(pattern => pattern.test(value)) && !isNaN(new Date(value).getTime());
}

// Custom tooltip with your brand styling
const CustomTooltip = ({ active, payload, label, valueFormatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          {isDateString(label) ? formatXAxisDate(label) : label}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-medium">{formatChartLabel(entry.dataKey)}:</span>
            <span style={{ color: entry.color }}>
              {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Legend with proper labels
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center gap-6 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatChartLabel(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function AreaChart({
  data,
  categories = [],
  className = "",
  index = "date",
  colors = DEFAULT_COLORS,
  valueFormatter,
  showAnimation = true,
  showLegend = true,
  showGridLines = true,
  stack = false,
  ...props
}: ChartProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          {showGridLines && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />}
          <XAxis
            dataKey={index}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatXAxisDate}
          />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
          {showLegend && <Legend content={<CustomLegend />} />}
          {categories.map((category, idx) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stackId={stack ? "1" : undefined}
              stroke={colors[idx % colors.length]}
              fill={colors[idx % colors.length]}
              fillOpacity={0.1}
              strokeWidth={2}
              isAnimationActive={showAnimation}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart({
  data,
  categories = [],
  className = "",
  index = "date",
  colors = DEFAULT_COLORS,
  valueFormatter,
  showAnimation = true,
  showLegend = true,
  showGridLines = true,
  layout = "horizontal",
  ...props
}: ChartProps) {
  const isVertical = layout === "vertical";

  // Check if the first data item's index value is a date
  const shouldFormatAsDates = data.length > 0 && data[0][index] && isDateString(data[0][index]);

  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={isVertical ? "horizontal" : "vertical"}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {showGridLines && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />}
          <XAxis
            type={isVertical ? "number" : "category"}
            dataKey={isVertical ? undefined : index}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={!isVertical && shouldFormatAsDates ? formatXAxisDate : undefined}
          />
          <YAxis
            type={isVertical ? "category" : "number"}
            dataKey={isVertical ? index : undefined}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
          {showLegend && <Legend content={<CustomLegend />} />}
          {categories.map((category, idx) => (
            <Bar
              key={category}
              dataKey={category}
              fill={colors[idx % colors.length]}
              radius={[4, 4, 0, 0]}
              isAnimationActive={showAnimation}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChart({
  data,
  categories = [],
  className = "",
  index = "date",
  colors = DEFAULT_COLORS,
  valueFormatter,
  showAnimation = true,
  showLegend = true,
  showGridLines = true,
  ...props
}: ChartProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          {showGridLines && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />}
          <XAxis
            dataKey={index}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatXAxisDate}
          />
          <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
          {showLegend && <Legend content={<CustomLegend />} />}
          {categories.map((category, idx) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[idx % colors.length]}
              strokeWidth={3}
              dot={{ fill: colors[idx % colors.length], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2, fill: colors[idx % colors.length] }}
              isAnimationActive={showAnimation}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChart({
  data,
  category = "value",
  className = "",
  index = "name",
  colors = DEFAULT_COLORS,
  valueFormatter,
  showAnimation = true,
  showLegend = true,
  ...props
}: ChartProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={120}
            paddingAngle={3}
            dataKey={category}
            isAnimationActive={showAnimation}
            animationDuration={1500}
            animationEasing="ease-in-out"
          >
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} />
          {showLegend && <Legend content={<CustomLegend />} />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
