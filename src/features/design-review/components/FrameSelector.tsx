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
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Select Frames to Analyze</h3>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-5 rounded-sm" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Select Frames to Analyze</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSelectAll}
            disabled={selectedCount === totalCount}
          >
            <CheckCheck className="mr-1 h-4 w-4" />
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDeselectAll}
            disabled={selectedCount === 0}
          >
            <X className="mr-1 h-4 w-4" />
            Deselect All
          </Button>
          <Button 
            onClick={onAnalyze}
            disabled={selectedCount === 0}
          >
            <Check className="mr-1 h-4 w-4" />
            Analyze Selected ({selectedCount})
          </Button>
        </div>
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
              <img 
                src={frame.imageUrl} 
                alt={frame.name}
                className="w-full h-full object-cover"
              />
              {(hoveredFrame === frame.frameId || frame.selected) && (
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
                <p className="text-sm font-medium truncate" title={frame.name}>
                  {frame.name}
                </p>
                <Checkbox 
                  checked={frame.selected}
                  onCheckedChange={() => onToggleFrame(frame.frameId)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
