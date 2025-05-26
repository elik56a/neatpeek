"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { useToast } from "@/hooks/use-toast";
import {
  DesignAnalysisInput,
  DesignRecheckInput,
  DesignRecheckResult,
  FrameSelectionState,
  DesignsReview,
} from "../types";
import { useRouter } from "next/navigation";

/**
 * Hook for design review functionality
 */
export function useDesignReview() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecheckLoading, setIsRecheckLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [frames, setFrames] = useState<FrameSelectionState[]>([]);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [designsReview, setDesignsReview] = useState<DesignsReview | null>(null);
  const { toast } = useToast();
  const api = useFetch();
  const router = useRouter();

  const getDesignsReview = async (designsReviewId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/design-review/${designsReviewId}`);
      const data = await response.json();
      setDesignsReview(data);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get frames from a Figma file
   * @param figmaUrl Figma URL
   */
  const getFrames = async (figmaUrl: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/design-review/frames", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ figmaUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get frames");
      }

      const data = await response.json();

      setFileKey(data.fileKey);
      setFileName(data.fileName);
      setFrames(
        data.frames.map((frame: any) => ({
          frameId: frame.id,
          name: frame.name,
          imageUrl: frame.imageUrl,
          selected: true,
        }))
      );

      return data;
    } catch (error: any) {
      setError(error);
      toast({
        title: "Error",
        description: error.message || "Failed to get frames",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle frame selection
   * @param frameId Frame ID
   */
  const toggleFrameSelection = (frameId: string) => {
    setFrames(prevFrames =>
      prevFrames.map(frame =>
        frame.frameId === frameId ? { ...frame, selected: !frame.selected } : frame
      )
    );
  };

  /**
   * Select all frames
   */
  const selectAllFrames = () => {
    setFrames(prevFrames => prevFrames.map(frame => ({ ...frame, selected: true })));
  };

  /**
   * Deselect all frames
   */
  const deselectAllFrames = () => {
    setFrames(prevFrames => prevFrames.map(frame => ({ ...frame, selected: false })));
  };

  /**
   * Review design
   * @param input Review input
   */
  const reviewDesign = async (input: DesignAnalysisInput): Promise<DesignsReview> => {
    setIsLoading(true);
    setError(null);
    setDesignsReview(null);

    try {
      const response = await fetch("/api/design-review/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to review design");
      }

      const data = await response.json();
      if (data.id) {
        setDesignsReview(data);
        router.replace(`/design-review/${data.id}`);

        toast({
          title: "Review Complete",
          description: "Design review has been completed successfully.",
        });
      }

      return data;
    } catch (error: any) {
      setError(error);
      toast({
        title: "Error",
        description: error.message || "Failed to review design",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Recheck design
   * @param input Recheck input
   */
  const recheckDesign = async (input: DesignRecheckInput) => {
    try {
      setIsRecheckLoading(true);
      const { data } = await api.post<DesignRecheckInput, DesignRecheckResult>(
        `design-review/${input.designsReviewId}/recheck`,
        input
      );

      if (data.designsReviewId) {
        await getDesignsReview(data.designsReviewId);
      }
      setIsRecheckLoading(false);

      toast({
        title: "Recheck Complete",
        description: "Design recheck has been completed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to recheck design",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsRecheckLoading(false);
    }
  };

  /**
   * Reset state
   */
  const reset = () => {
    setFrames([]);
    setFileKey(null);
    setFileName(null);
    setDesignsReview(null);
    setError(null);
  };

  return {
    isLoading,
    isRecheckLoading,
    error,
    frames,
    fileKey,
    fileName,
    designsReview,
    getFrames,
    toggleFrameSelection,
    selectAllFrames,
    deselectAllFrames,
    reviewDesign,
    recheckDesign,
    reset,
    getDesignsReview,
  };
}
