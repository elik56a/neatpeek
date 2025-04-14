"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { FrameSelectionState } from "../types";
import { Check, CheckCheck, X } from "lucide-react";

interface FrameSelectorProps {
  frames: FrameSelectionState[];
  isLoading: boolean;
  onToggleFrame: (frameId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAnalyze: () => void;
}

/**
 * Component for selecting frames to analyze
 */
export function FrameSelector({
  frames,
  isLoading,
  onToggleFrame,
  onSelectAll,
  onDeselectAll,
  onAnalyze,
}: FrameSelectorProps) {
  const [hoveredFrame, setHoveredFrame] = useState<string | null>(null);

  // Count selected frames
  const selectedCount = frames.filter(frame => frame.selected).length;
  const totalCount = frames.length;

  // We'll show skeletons for each frame during loading instead of hiding all frames

  // No frames state
  if (frames.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No frames found in this Figma file.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Please make sure the file contains frames and you have access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with selection tools */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium">Select Frames to Review</h3>
          <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {selectedCount} of {totalCount} selected
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            disabled={selectedCount === totalCount || isLoading}
            className="h-8 px-2 text-xs"
          >
            <CheckCheck className="mr-1 h-3.5 w-3.5" />
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeselectAll}
            disabled={selectedCount === 0 || isLoading}
            className="h-8 px-2 text-xs"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Deselect All
          </Button>
        </div>
      </div>

      {/* Main action button - centered and prominent */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={onAnalyze}
          disabled={selectedCount === 0 || isLoading}
          className={`w-full max-w-md py-6 text-base font-medium shadow-sm transition-all duration-300 ${isLoading ? 'bg-primary/80' : ''} ${selectedCount > 0 && !isLoading ? 'animate-pulse-subtle' : ''}`}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              AI Analyzing Your Frames...
            </>
          ) : (
            <>
              <Check className="mr-2 h-5 w-5" />
              Review Selected Frames ({selectedCount})
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {frames.map((frame) => (
          <Card
            key={frame.frameId}
            className={`overflow-hidden transition-all duration-200 ${
              frame.selected ? "ring-2 ring-primary" : "hover:border-muted-foreground/50"
            }`}
            onMouseEnter={() => setHoveredFrame(frame.frameId)}
            onMouseLeave={() => setHoveredFrame(null)}
          >
            <div className="relative aspect-video bg-muted">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <img
                  src={frame.imageUrl}
                  alt={frame.name}
                  className="w-full h-full object-cover"
                />
              )}
              {!isLoading && (hoveredFrame === frame.frameId || frame.selected) && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Checkbox
                    checked={frame.selected}
                    onCheckedChange={() => onToggleFrame(frame.frameId)}
                    className="h-6 w-6 border-2"
                  />
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                {isLoading ? (
                  <>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-5 rounded-sm" />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium truncate" title={frame.name}>
                      {frame.name}
                    </p>
                    <Checkbox
                      checked={frame.selected}
                      onCheckedChange={() => onToggleFrame(frame.frameId)}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
