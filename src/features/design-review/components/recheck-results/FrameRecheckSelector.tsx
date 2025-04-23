"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DesignAnalysisResult } from "../../types";
import { Check, CheckCheck, X, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/utils/cn";

// Import ScrollArea dynamically with SSR disabled
const ScrollArea = dynamic(
  () => import("@/components/ui/scroll-area").then(mod => mod.ScrollArea),
  { ssr: false }
);

interface FrameRecheckSelectorProps {
  result: DesignAnalysisResult;
  activeFrameId: string | null;
  onFrameSelect: (frameId: string) => void;
  onRecheck: (frameIds: string[]) => void;
  isLoading: boolean;
}

/**
 * Component for navigating between frames and selecting which ones to recheck
 */
export function FrameRecheckSelector({
  result,
  activeFrameId,
  onFrameSelect,
  onRecheck,
  isLoading
}: FrameRecheckSelectorProps) {
  const [selectedFrames, setSelectedFrames] = useState<Set<string>>(new Set([activeFrameId || ""]));
  // Remove the view state - we'll combine navigation and selection

  // Get all frames from the result with status information
  const frames = (result.reviews || []).map(review => {
    // Count issues by status
    const brandIssues = review.brand_issues || [];
    const generalIssues = review.general_issues || [];
    const allIssues = [...brandIssues, ...generalIssues];

    const fixedCount = allIssues.filter(issue => issue.status === 'fixed').length;
    const partiallyFixedCount = allIssues.filter(issue => issue.status === 'partially_fixed').length;
    const notFixedCount = allIssues.filter(issue => issue.status === 'not_fixed').length;
    // For now, we'll set newIssuesCount to 0 since the is_new property doesn't exist in the type
    const newIssuesCount = 0; // allIssues.filter(issue => (issue as any).is_new).length;

    // Determine the overall status
    let status = 'none';
    if (fixedCount > 0 && notFixedCount === 0 && partiallyFixedCount === 0) {
      status = 'all_fixed';
    } else if (fixedCount > 0 || partiallyFixedCount > 0) {
      status = 'partially_fixed';
    } else if (notFixedCount > 0) {
      status = 'not_fixed';
    }

    return {
      frameId: review.image.frame_id,
      name: review.image.name,
      imageUrl: review.image.url,
      selected: selectedFrames.has(review.image.frame_id),
      status,
      fixedCount,
      partiallyFixedCount,
      notFixedCount,
      newIssuesCount,
      totalIssues: allIssues.length
    };
  });

  // Toggle frame selection
  const toggleFrameSelection = (frameId: string) => {
    const newSelection = new Set(selectedFrames);
    if (newSelection.has(frameId)) {
      newSelection.delete(frameId);
    } else {
      newSelection.add(frameId);
    }
    setSelectedFrames(newSelection);
  };

  // Select all frames
  const selectAllFrames = () => {
    const allFrameIds = frames.map(frame => frame.frameId);
    setSelectedFrames(new Set(allFrameIds));
  };

  // Deselect all frames
  const deselectAllFrames = () => {
    setSelectedFrames(new Set());
  };

  // Handle recheck
  const handleRecheck = () => {
    onRecheck(Array.from(selectedFrames));
  };

  return (
    <div className="space-y-4">
      {/* Frame navigation with checkboxes for selection */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Frames</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedFrames.size} of {frames.length} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllFrames}
            disabled={selectedFrames.size === frames.length || isLoading}
            className="h-8 px-2 text-xs"
          >
            <CheckCheck className="mr-1 h-3.5 w-3.5" />
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deselectAllFrames}
            disabled={selectedFrames.size === 0 || isLoading}
            className="h-8 px-2 text-xs"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            None
          </Button>
        </div>
      </div>

      {/* Combined frame navigation and selection */}
      <ScrollArea className="h-[180px] border rounded-md p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-1">
          {frames.map((frame) => (
            <div key={frame.frameId} className="relative">
              <Button
                variant={activeFrameId === frame.frameId ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-auto py-2 px-3 flex flex-col items-center gap-2 w-full group", // Added group class for hover effects
                  activeFrameId === frame.frameId ? "bg-primary text-primary-foreground" : "bg-background",
                  selectedFrames.has(frame.frameId) ? "ring-2 ring-primary ring-offset-1" : ""
                )}
                onClick={() => onFrameSelect(frame.frameId)}
              >
                <div className="w-full aspect-video overflow-hidden rounded-sm border relative"> {/* Increased size and made responsive */}
                  <img
                    src={`${frame.imageUrl}?t=${Date.now()}`} /* Add cache-busting parameter */
                    alt={frame.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col items-center w-full">
                  <div className="flex items-center justify-between w-full px-1">
                    <span className="text-xs font-medium truncate max-w-[80%]">{frame.name}</span>
                    {/* Checkbox for selection - at the bottom */}
                    <div
                      className="flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFrameSelection(frame.frameId);
                      }}
                    >
                      <Checkbox
                        checked={selectedFrames.has(frame.frameId)}
                        className={cn(
                          "h-4 w-4 border-2",
                          activeFrameId === frame.frameId ? "border-primary" : "border-gray-400"
                        )}
                      />
                    </div>
                  </div>
                  {frame.totalIssues > 0 && (
                    <div className="flex items-center gap-1 mt-1 w-full justify-center">
                      {frame.status === 'all_fixed' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-green-100 text-green-800">
                          <Check className="h-2.5 w-2.5 mr-0.5" /> Fixed
                        </span>
                      )}
                      {frame.status === 'partially_fixed' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-100 text-amber-800">
                          {frame.fixedCount}/{frame.totalIssues} Fixed
                        </span>
                      )}
                      {frame.status === 'not_fixed' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-red-100 text-red-800">
                          <X className="h-2.5 w-2.5 mr-0.5" /> Issues
                        </span>
                      )}
                      {frame.newIssuesCount > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-blue-100 text-blue-800">
                          +{frame.newIssuesCount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Recheck button - centered and elegant */}
      <div className="flex justify-center mt-4">
        <Button
          onClick={handleRecheck}
          disabled={selectedFrames.size === 0 || isLoading}
          variant="default"
          className={cn(
            "px-6 py-2 h-auto text-sm font-medium rounded-md transition-all duration-200",
            "shadow-sm hover:shadow-md",
            selectedFrames.size > 0 && !isLoading ? "bg-primary hover:bg-primary/90" : ""
          )}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Rechecking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recheck Selected ({selectedFrames.size})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
