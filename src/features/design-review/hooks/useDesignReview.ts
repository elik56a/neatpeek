/**
 * Hook for design review functionality
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  DesignAnalysisInput,
  DesignAnalysisResult,
  DesignRecheckInput,
  DesignRecheckResult,
  FrameSelectionState
} from '../types';

/**
 * Hook for design review functionality
 */
export function useDesignReview() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [frames, setFrames] = useState<FrameSelectionState[]>([]);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DesignAnalysisResult | null>(null);
  const [recheckResult, setRecheckResult] = useState<DesignRecheckResult | null>(null);
  const { toast } = useToast();

  /**
   * Get frames from a Figma file
   * @param figmaUrl Figma URL
   */
  const getFrames = async (figmaUrl: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/design-review/frames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ figmaUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get frames');
      }

      const data = await response.json();

      setFileKey(data.fileKey);
      setFileName(data.fileName);
      setFrames(data.frames.map((frame: any) => ({
        frameId: frame.id,
        name: frame.name,
        imageUrl: frame.imageUrl,
        selected: true,
      })));

      return data;
    } catch (error: any) {
      setError(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get frames',
        variant: 'destructive',
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
        frame.frameId === frameId
          ? { ...frame, selected: !frame.selected }
          : frame
      )
    );
  };

  /**
   * Select all frames
   */
  const selectAllFrames = () => {
    setFrames(prevFrames =>
      prevFrames.map(frame => ({ ...frame, selected: true }))
    );
  };

  /**
   * Deselect all frames
   */
  const deselectAllFrames = () => {
    setFrames(prevFrames =>
      prevFrames.map(frame => ({ ...frame, selected: false }))
    );
  };

  /**
   * Review design
   * @param input Review input
   */
  const reviewDesign = async (input: DesignAnalysisInput) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/design-review/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to review design');
      }

      const data = await response.json();
      setAnalysisResult(data);

      toast({
        title: 'Review Complete',
        description: 'Design review has been completed successfully.',
      });

      // Add reviewId to the data for redirection
      return {
        ...data,
        reviewId: data.sessionId
      };
    } catch (error: any) {
      setError(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to review design',
        variant: 'destructive',
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
    setIsLoading(true);
    setError(null);
    setRecheckResult(null);

    try {
      const response = await fetch('/api/design-review/recheck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to recheck design');
      }

      const data = await response.json();
      setRecheckResult(data);

      toast({
        title: 'Recheck Complete',
        description: 'Design recheck has been completed successfully.',
      });

      // Add reviewId to the data for redirection
      return {
        ...data,
        reviewId: data.sessionId
      };
    } catch (error: any) {
      setError(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to recheck design',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset state
   */
  const reset = () => {
    setFrames([]);
    setFileKey(null);
    setFileName(null);
    setAnalysisResult(null);
    setRecheckResult(null);
    setError(null);
  };

  return {
    isLoading,
    error,
    frames,
    fileKey,
    fileName,
    analysisResult,
    recheckResult,
    getFrames,
    toggleFrameSelection,
    selectAllFrames,
    deselectAllFrames,
    analyzeDesign: reviewDesign, // Keep old name for backward compatibility
    reviewDesign,
    recheckDesign,
    reset,
  };
}
