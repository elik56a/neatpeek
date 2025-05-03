"use client";

import { cn } from "@/utils/cn";

interface ColorValueDisplayProps {
  value: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ColorValueDisplay({ value, showText = true, size = "lg" }: ColorValueDisplayProps) {
  // Determine the size of the color swatch
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center gap-2")}>
      {/* Main color/gradient display */}
      <div
        className={cn("rounded-full border border-gray-200", sizeClasses[size])}
        style={{
          background: value,
          backgroundSize: "100% 100%", // Ensure the gradient covers the entire element
          backgroundRepeat: "no-repeat",
        }}
        title={value}
      />

      {/* Optional text display */}
      {showText && <p className="text-sm font-medium">{value}</p>}
    </div>
  );
}
