"use client";

import { cn } from "@/utils/cn";

interface CustomLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export function CustomLoader({ size = "md", className, text = "Loading..." }: CustomLoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className="absolute w-full h-full border-4 border-muted rounded-full"></div>
        <div className="absolute w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "rounded-full bg-background",
              size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
            )}
          ></div>
        </div>
      </div>
      <p className="mt-4 text-muted-foreground animate-pulse">{text}</p>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <CustomLoader size="xl" />
        <p className="mt-4 text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
