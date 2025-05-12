"use client";

import { useState } from "react";
import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ExportButton, AnalysisDetails } from "./analysis-results";
import { TimelineDrawer } from "./timeline";
import { FrameRecheckSelector } from "./recheck-results";
import { DesignsReview } from "../types";

interface AnalysisResultsProps {
  designsReview: DesignsReview;
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
  designsReview,
  onRecheck,
  figmaFileName,
  showTimeline = false,
  isRecheckLoading = false,
}: AnalysisResultsProps) {
  const [isTimelineVisible, setIsTimelineVisible] = useState(false);
  const [activeFrameId, setActiveFrameId] = useState<string | null>(
    designsReview?.designs?.length > 0 ? designsReview.designs[0].frameId : null
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Design Review Results</h2>
        <div className="flex gap-2 items-center">
          {designsReview.id && showTimeline && (
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
                designsReviewId={designsReview.id}
                isOpen={isTimelineVisible}
                onClose={() => setIsTimelineVisible(false)}
              />
            </>
          )}
          <ExportButton designsReview={designsReview} figmaFileName={figmaFileName} />
        </div>
      </div>

      {/* Frame navigation and selection */}
      <div className="mb-6">
        <FrameRecheckSelector
          designsReview={designsReview}
          activeFrameId={activeFrameId}
          onFrameSelect={setActiveFrameId}
          onRecheck={onRecheck}
          isLoading={isRecheckLoading}
        />
      </div>

      {/* Main content with all the UI elements */}
      <div>
        <AnalysisDetails
          designsReview={designsReview}
          figmaFileName={figmaFileName}
          activeFrameId={activeFrameId}
        />
      </div>
    </div>
  );
}
