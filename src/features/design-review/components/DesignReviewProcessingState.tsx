"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { DesignsReview } from "../types";
import { isReviewPending } from "../utils/status-helpers";
import { useProgressSteps } from "../hooks/useProgressSteps";
import { appConfig } from "@/config/app";

interface DesignReviewProcessingStateProps {
  designsReview: DesignsReview;
}

export function DesignReviewProcessingState({ designsReview }: DesignReviewProcessingStateProps) {
  const { animatedProgress, currentStepText } = useProgressSteps({
    status: designsReview.status,
  });

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
            <Link href="/design-review">
              <AlertCircle className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{designsReview.name}</h1>
            <p className="text-sm text-muted-foreground">Brand Compliance Analysis</p>
          </div>
        </div>

        {/* Processing Card */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  {isReviewPending(designsReview.status) ? (
                    <Clock className="h-6 w-6 text-primary animate-pulse" />
                  ) : (
                    <Sparkles
                      className="h-6 w-6 text-primary animate-spin"
                      style={{ animationDuration: "3s" }}
                    />
                  )}
                </div>
                <div
                  className="absolute inset-0 w-12 h-12 bg-primary/20 rounded-full animate-ping"
                  style={{ animationDuration: "2s" }}
                ></div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-primary">
                    {isReviewPending(designsReview.status)
                      ? "🚀 Initializing Analysis"
                      : `🔍 ${appConfig.name} Analysis in Progress`}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isReviewPending(designsReview.status)
                      ? "Setting up the analysis environment..."
                      : "Deep-scanning for brand guideline adherence..."}
                  </p>
                </div>

                {/* Progress Bar Only */}
                <div className="space-y-3">
                  <div className="w-full bg-primary/10 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="h-3 rounded-full transition-all duration-700 ease-out relative overflow-hidden shadow-sm"
                      style={{
                        width: `${animatedProgress}%`,
                        background: `linear-gradient(90deg, 
                          hsl(var(--primary)) 0%, 
                          hsl(var(--primary) / 0.9) 20%,
                          hsl(var(--primary) / 0.8) 40%,
                          hsl(var(--primary) / 0.9) 60%,
                          hsl(var(--primary)) 80%,
                          hsl(var(--primary) / 1.1) 100%)`,
                      }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
                        style={{ animationDelay: "1s" }}
                      ></div>
                    </div>
                  </div>

                  {/* Current Step */}
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-xs text-primary font-medium">{currentStepText}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">✨</span>
              <div className="text-sm text-muted-foreground">
                <strong className="text-primary">Pro Tip:</strong> While you wait, our AI is
                cross-referencing your design against your brand guidelines, checking for
                consistency in colors, fonts, spacing, and visual hierarchy to ensure perfect brand
                compliance.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
