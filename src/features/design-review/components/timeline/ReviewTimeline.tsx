"use client";

import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { CustomLoader } from "@/components/ui/custom-loader";
import { AlertCircle } from "lucide-react";
import { ReviewHistoryEntry } from "../../types";
import { TimelineEvent } from "../timeline";

interface ReviewTimelineProps {
  designsReviewId: string;
  isVisible: boolean;
  onToggle?: () => void;
}

/**
 * Component for displaying a review timeline
 */
export function ReviewTimeline({ designsReviewId, isVisible }: ReviewTimelineProps) {
  const [history, setHistory] = useState<ReviewHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch history when the component mounts or reviewId changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!designsReviewId || !isVisible) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/design-review/history?designsReviewId=${designsReviewId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch history");
        }

        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
        setError(error instanceof Error ? error : new Error("Failed to fetch history"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [designsReviewId, isVisible]);

  return (
    <div className="relative">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CustomLoader size="sm" />
          <p className="mt-2 text-sm text-muted-foreground">Loading timeline...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-4">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      ) : history.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No history available.</p>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {history.map((event, index) => (
            <div key={event.id}>
              <TimelineEvent event={event} isFirst={index === 0} />
              {index < history.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
