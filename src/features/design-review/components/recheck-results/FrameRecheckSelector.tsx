"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DesignAnalysisResult } from "../../types";
import { CheckCheck, X, RefreshCw } from "lucide-react";
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

  // Get all frames from the result
  const frames = result.reviews.map(review => ({
    frameId: review.image.frame_id,
    name: review.image.name,
    imageUrl: review.image.url,
    selected: selectedFrames.has(review.image.frame_id)
  }));

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
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Frames</h3>
          <span className="text-xs text-muted-foreground">
            {selectedFrames.size} of {frames.length} selected
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllFrames}
            disabled={selectedFrames.size === frames.length || isLoading}
            className="h-7 px-2 text-xs"
          >
            <CheckCheck className="mr-1 h-3 w-3" />
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deselectAllFrames}
            disabled={selectedFrames.size === 0 || isLoading}
            className="h-7 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            None
          </Button>
        </div>
      </div>

      {/* Vertical scrolling frame list */}
      <div className="border rounded-md p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 place-content-center">
          {frames.map((frame) => (
            <div key={frame.frameId} className="relative w-[140px] flex flex-col">
              {/* Frame name at the top */}
              <div className="mb-1 text-center">
                <span className="text-xs truncate block max-w-[140px]">{frame.name}</span>
              </div>

              {/* Frame preview */}
              <div
                className={cn(
                  "relative cursor-pointer rounded-md overflow-hidden border",
                  activeFrameId === frame.frameId ? "ring-2 ring-primary ring-offset-1" : ""
                )}
                onClick={() => onFrameSelect(frame.frameId)}
              >
                <div className="w-[140px] h-[100px] overflow-hidden">
                  <img
                    src={`${frame.imageUrl}?t=${Date.now()}`} /* Add cache-busting parameter */
                    alt={frame.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Selection checkbox centered at the bottom */}
              <div
                className="mt-1 flex justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFrameSelection(frame.frameId);
                }}
              >
                <Checkbox
                  checked={selectedFrames.has(frame.frameId)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recheck button - fixed at the bottom */}
      <div className="sticky bottom-0 bg-background pt-2 pb-1 border-t mt-2">
        <Button
          onClick={handleRecheck}
          disabled={selectedFrames.size === 0 || isLoading}
          variant="default"
          className={cn(
            "w-full px-4 py-2 h-auto text-sm font-medium rounded-md transition-all duration-200",
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
