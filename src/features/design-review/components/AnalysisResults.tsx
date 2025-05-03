"use client";

import { useState } from "react";
import { DesignAnalysisResult } from "../types";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
// Drawer imports removed as we're using a custom drawer
import { ExportButton, AnalysisDetails } from "./analysis-results";
import { TimelineDrawer } from "./timeline";
import { FrameRecheckSelector } from "./recheck-results";

interface AnalysisResultsProps {
  result: DesignAnalysisResult;
  onRecheck: (frameIds?: string[]) => void;
  figmaFileName?: string;
  showTimeline?: boolean;
  isRecheckLoading?: boolean;
}

/**
 * Main component for displaying design analysis results
 * This component is split into smaller, focused components
 */
export function AnalysisResults({
  result,
  onRecheck,
  figmaFileName,
  showTimeline = false,
  isRecheckLoading = false,
}: AnalysisResultsProps) {
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [activeFrameId, setActiveFrameId] = useState<string | null>(
    result.reviews.length > 0 ? result.reviews[0].image.frame_id : null
  );

  // Timeline visibility is now controlled by the Dialog component

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Design Review Results</h2>
        <div className="flex gap-2 items-center">
          {result.reviewId && showTimeline && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={isTimelineVisible ? "bg-muted" : ""}
                    onClick={() => setIsTimelineVisible(true)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                  <TooltipContent>
                    <p>View Timeline</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Custom timeline drawer that slides in from the right */}
              <TimelineDrawer
                reviewId={result.reviewId}
                isOpen={isTimelineVisible}
                onClose={() => setIsTimelineVisible(false)}
              />
            </>
          )}
          <ExportButton result={result} figmaFileName={figmaFileName} />
        </div>
      </div>

      {/* Frame navigation and selection */}
      <div className="mb-6">
        <FrameRecheckSelector
          result={result}
          activeFrameId={activeFrameId}
          onFrameSelect={setActiveFrameId}
          onRecheck={onRecheck}
          isLoading={isRecheckLoading}
        />
      </div>

      {/* Main content with all the UI elements */}
      <div>
        <AnalysisDetails
          result={result}
          figmaFileName={figmaFileName}
          activeFrameId={activeFrameId}
        />
      </div>
    </div>
  );
}
