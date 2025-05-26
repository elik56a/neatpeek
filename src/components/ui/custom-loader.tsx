"use client";

import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";

interface CustomLoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "spinner" | "dots" | "pulse" | "bars" | "orbit" | "wave" | "gradient";
  className?: string;
  text?: string;
  showText?: boolean;
  speed?: "slow" | "normal" | "fast";
  color?: "primary" | "secondary" | "accent" | "muted" | "gradient";
  fullPage?: boolean;
  backdrop?: boolean;
  loadingTips?: string[];
}

export function CustomLoader({
  size = "md",
  variant = "spinner",
  className,
  text = "Loading...",
  showText = false,
  speed = "normal",
  color = "primary",
  fullPage = false,
  backdrop = false,
  loadingTips = [],
}: CustomLoaderProps) {
  const [currentTip, setCurrentTip] = useState(0);
  const [dots, setDots] = useState("");

  // Cycle through loading tips if provided
  useEffect(() => {
    if (loadingTips.length > 0) {
      const interval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % loadingTips.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loadingTips]);

  // Animate dots for text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    "2xl": "w-32 h-32",
  };

  const speedClasses = {
    slow: "duration-2000",
    normal: "duration-1000",
    fast: "duration-500",
  };

  const colorClasses = {
    primary: "border-primary text-primary",
    secondary: "border-secondary text-secondary",
    accent: "border-accent text-accent",
    muted: "border-muted-foreground text-muted-foreground",
    gradient: "bg-gradient-to-r from-primary via-purple-500 to-pink-500",
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  const renderLoader = () => {
    const baseClasses = cn(sizeClasses[size], className);

    switch (variant) {
      case "spinner":
        return (
          <div className={cn("relative", baseClasses)}>
            {/* Background track */}
            <div className="absolute w-full h-full border-4 border-muted/50 rounded-full"></div>

            {/* Spinning border */}
            <div
              className={cn(
                "absolute w-full h-full border-4 border-transparent rounded-full",
                color === "gradient"
                  ? "border-t-primary border-r-purple-500/50"
                  : color === "primary"
                    ? "border-t-primary"
                    : color === "secondary"
                      ? "border-t-secondary"
                      : color === "accent"
                        ? "border-t-accent"
                        : "border-t-muted-foreground"
              )}
              style={{
                animation: `spin ${speed === "fast" ? "0.8s" : speed === "slow" ? "1.5s" : "1s"} linear infinite`,
              }}
            ></div>
          </div>
        );

      case "dots":
        return (
          <div className={cn("flex space-x-1", baseClasses)}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={cn(
                  "rounded-full animate-bounce",
                  color === "gradient"
                    ? "bg-gradient-to-r from-primary to-pink-500"
                    : `bg-current ${colorClasses[color]}`,
                  size === "xs"
                    ? "w-1 h-1"
                    : size === "sm"
                      ? "w-1.5 h-1.5"
                      : size === "md"
                        ? "w-2 h-2"
                        : size === "lg"
                          ? "w-3 h-3"
                          : size === "xl"
                            ? "w-4 h-4"
                            : "w-5 h-5"
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: speed === "fast" ? "0.6s" : speed === "slow" ? "1.4s" : "1s",
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <div className={cn("relative", baseClasses)}>
            {/* Outer pulsing ring */}
            <div
              className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-20",
                color === "gradient"
                  ? "bg-gradient-to-r from-primary to-pink-500"
                  : `bg-current ${colorClasses[color]}`
              )}
              style={{
                animationDuration: speed === "fast" ? "1s" : speed === "slow" ? "3s" : "2s",
              }}
            ></div>

            {/* Middle pulsing ring */}
            <div
              className={cn(
                "absolute inset-2 rounded-full animate-ping opacity-40",
                color === "gradient"
                  ? "bg-gradient-to-r from-primary to-pink-500"
                  : `bg-current ${colorClasses[color]}`
              )}
              style={{
                animationDelay: "0.5s",
                animationDuration: speed === "fast" ? "1s" : speed === "slow" ? "3s" : "2s",
              }}
            ></div>

            {/* Inner breathing ring */}
            <div
              className={cn(
                "absolute inset-4 rounded-full animate-pulse opacity-60",
                color === "gradient"
                  ? "bg-gradient-to-r from-primary to-pink-500"
                  : `bg-current ${colorClasses[color]}`
              )}
              style={{
                animationDuration: speed === "fast" ? "1.5s" : speed === "slow" ? "3.5s" : "2.5s",
              }}
            ></div>

            {/* Core element with subtle scale animation */}
            <div
              className={cn(
                "relative rounded-full transition-all duration-300 ease-in-out",
                color === "gradient"
                  ? "bg-gradient-to-r from-primary via-purple-500 to-pink-500 shadow-lg shadow-primary/25"
                  : `bg-current ${colorClasses[color]}`,
                size === "xs"
                  ? "inset-1"
                  : size === "sm"
                    ? "inset-1"
                    : size === "md"
                      ? "inset-2"
                      : size === "lg"
                        ? "inset-3"
                        : size === "xl"
                          ? "inset-4"
                          : "inset-6"
              )}
              style={{
                animation: `pulse-scale ${speed === "fast" ? "2s" : speed === "slow" ? "4s" : "3s"} ease-in-out infinite`,
              }}
            ></div>

            {/* Central glow dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  "rounded-full animate-pulse",
                  color === "gradient" ? "bg-white shadow-lg shadow-white/50" : "bg-background",
                  size === "xs"
                    ? "w-1 h-1"
                    : size === "sm"
                      ? "w-1.5 h-1.5"
                      : size === "md"
                        ? "w-2 h-2"
                        : size === "lg"
                          ? "w-3 h-3"
                          : size === "xl"
                            ? "w-4 h-4"
                            : "w-5 h-5"
                )}
                style={{
                  animationDuration: speed === "fast" ? "1s" : speed === "slow" ? "2s" : "1.5s",
                }}
              ></div>
            </div>

            {/* Add custom CSS for the scale animation */}
            <style jsx>{`
              @keyframes pulse-scale {
                0%,
                100% {
                  transform: scale(1);
                  opacity: 1;
                }
                50% {
                  transform: scale(0.9);
                  opacity: 0.8;
                }
              }
            `}</style>
          </div>
        );

      case "bars":
        return (
          <div className={cn("flex items-end space-x-1", baseClasses)}>
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={cn(
                  "animate-pulse",
                  color === "gradient"
                    ? "bg-gradient-to-t from-primary to-pink-500"
                    : `bg-current ${colorClasses[color]}`,
                  size === "xs"
                    ? "w-0.5"
                    : size === "sm"
                      ? "w-1"
                      : size === "md"
                        ? "w-1.5"
                        : size === "lg"
                          ? "w-2"
                          : size === "xl"
                            ? "w-3"
                            : "w-4"
                )}
                style={{
                  height: `${20 + Math.sin(i) * 10}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: speed === "fast" ? "0.8s" : speed === "slow" ? "1.6s" : "1.2s",
                }}
              />
            ))}
          </div>
        );

      case "orbit":
        return (
          <div className={cn("relative", baseClasses)}>
            <div
              className={cn(
                "absolute inset-0 rounded-full border-2 border-dashed animate-spin",
                colorClasses[color],
                speedClasses[speed]
              )}
            ></div>
            <div
              className={cn(
                "absolute top-0 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1 rounded-full animate-spin",
                color === "gradient"
                  ? "bg-gradient-to-r from-primary to-pink-500"
                  : `bg-current ${colorClasses[color]}`,
                speedClasses[speed]
              )}
            ></div>
          </div>
        );

      case "wave":
        return (
          <div className={cn("flex items-center space-x-1", baseClasses)}>
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={cn(
                  "rounded-full animate-bounce",
                  color === "gradient"
                    ? "bg-gradient-to-b from-primary to-pink-500"
                    : `bg-current ${colorClasses[color]}`,
                  size === "xs"
                    ? "w-1 h-6"
                    : size === "sm"
                      ? "w-1 h-8"
                      : size === "md"
                        ? "w-1.5 h-12"
                        : size === "lg"
                          ? "w-2 h-16"
                          : size === "xl"
                            ? "w-3 h-20"
                            : "w-4 h-24"
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: speed === "fast" ? "0.6s" : speed === "slow" ? "1.4s" : "1s",
                }}
              />
            ))}
          </div>
        );

      case "gradient":
        return (
          <div className={cn("relative", baseClasses)}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-spin"></div>
            <div className="absolute inset-1 rounded-full bg-background"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-pink-500 animate-pulse"></div>
            </div>
          </div>
        );

      default:
        return renderLoader();
    }
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullPage ? "min-h-screen py-12" : "py-8",
        backdrop && "relative z-10"
      )}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="relative">
        {renderLoader()}

        {/* Subtle glow effect for larger sizes */}
        {(size === "xl" || size === "2xl") && variant !== "dots" && variant !== "bars" && (
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse",
              color === "gradient"
                ? "bg-gradient-to-r from-primary to-pink-500"
                : `bg-current ${colorClasses[color]}`
            )}
          ></div>
        )}
      </div>

      {showText && (
        <div className="mt-6 text-center">
          <p
            className={cn(
              "font-medium transition-all duration-300 ease-in-out",
              textSizeClasses[
                size === "2xl" ? "xl" : size === "xl" ? "lg" : size === "lg" ? "md" : "sm"
              ],
              colorClasses[color]
            )}
          >
            {loadingTips.length > 0 ? loadingTips[currentTip] : `${text}${dots}`}
          </p>

          {loadingTips.length > 0 && (
            <div className="flex justify-center mt-3 space-x-1">
              {loadingTips.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    index === currentTip
                      ? color === "gradient"
                        ? "bg-gradient-to-r from-primary to-pink-500"
                        : `bg-current ${colorClasses[color]}`
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (fullPage || backdrop) {
    return (
      <div
        className={cn(
          "fixed inset-0 flex items-center justify-center z-50",
          backdrop && "bg-background/80 backdrop-blur-sm"
        )}
      >
        <div className="text-center animate-in fade-in-0 zoom-in-95 duration-300">{content}</div>
      </div>
    );
  }

  return content;
}

// Preset loaders for common use cases
export function SpinnerLoader(props: Omit<CustomLoaderProps, "variant">) {
  return <CustomLoader {...props} variant="spinner" />;
}

export function DotsLoader(props: Omit<CustomLoaderProps, "variant">) {
  return <CustomLoader {...props} variant="dots" />;
}

export function PulseLoader(props: Omit<CustomLoaderProps, "variant">) {
  return <CustomLoader {...props} variant="pulse" />;
}

export function GradientLoader(props: Omit<CustomLoaderProps, "variant">) {
  return <CustomLoader {...props} variant="gradient" color="gradient" />;
}

// Full page loader with advanced features
export function FullPageLoader({
  variant = "gradient",
  text = "Loading your experience...",
  loadingTips = [
    "Preparing your workspace...",
    "Loading your designs...",
    "Almost ready...",
    "Just a moment more...",
  ],
  ...props
}: Omit<CustomLoaderProps, "fullPage" | "backdrop">) {
  return (
    <CustomLoader
      {...props}
      variant={variant}
      text={text}
      loadingTips={loadingTips}
      fullPage
      backdrop
      size="xl"
      color="gradient"
    />
  );
}

// Inline loader for smaller spaces
export function InlineLoader(props: Omit<CustomLoaderProps, "fullPage" | "showText">) {
  return <CustomLoader {...props} showText={false} size="sm" />;
}

// Button loader
export function ButtonLoader(props: Omit<CustomLoaderProps, "size" | "showText">) {
  return <CustomLoader {...props} size="xs" showText={false} variant="spinner" />;
}
