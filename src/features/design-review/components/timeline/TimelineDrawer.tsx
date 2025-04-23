"use client";

import * as React from "react";
import { X, History } from "lucide-react";
import { cn } from "@/utils/cn";
import { ReviewTimeline } from "./ReviewTimeline";

interface TimelineDrawerProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * A custom drawer component for the timeline that slides in from the right
 * without a background overlay
 */
export function TimelineDrawer({ sessionId, isOpen, onClose }: TimelineDrawerProps) {
  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={cn(
        "fixed right-4 bottom-4 z-50 w-[350px] sm:w-[400px] max-h-[80vh] rounded-lg border bg-card text-card-foreground shadow-lg transition-all duration-300 ease-in-out",
        isOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-[120%] opacity-0 pointer-events-none"
      )}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <History className="h-5 w-5 mr-2" />
            Review Timeline
          </h3>
          <button
            onClick={onClose}
            className="rounded-full h-6 w-6 inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          <ReviewTimeline sessionId={sessionId} isVisible={true} />
        </div>
      </div>
    </div>
  );
}
