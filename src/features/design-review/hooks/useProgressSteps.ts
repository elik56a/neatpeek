"use client";

import { useEffect, useState } from "react";
import { ReviewStatus } from "@prisma/client";
import { useInterval } from "@/hooks/useInterval";
import {
  getProcessingSteps,
  getProgressByStatus,
  isReviewPending,
  isReviewInProgress,
} from "../utils/status-helpers";

// Constants for timing
const TOTAL_DURATION_MS = 2 * 60 * 1000; // 2 minutes
const PROGRESS_UPDATE_INTERVAL = 100; // Update progress every 100ms

interface UseProgressStepsProps {
  status: ReviewStatus;
}

interface UseProgressStepsReturn {
  animatedProgress: number;
  currentStep: number;
  currentStepText: string;
}

export function useProgressSteps({ status }: UseProgressStepsProps): UseProgressStepsReturn {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const steps = getProcessingSteps();
  const targetProgress = getProgressByStatus(status);

  // Calculate step duration based on total duration
  const stepDuration = TOTAL_DURATION_MS / steps.length;

  // Initialize start time when processing begins
  useEffect(() => {
    if (isReviewPending(status) || isReviewInProgress(status)) {
      if (!startTime) {
        setStartTime(Date.now());
      }
    } else {
      setStartTime(null);
    }
  }, [status, startTime]);

  // Use the custom useInterval hook for progress updates
  useInterval(
    () => {
      if (!startTime) return;

      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / TOTAL_DURATION_MS) * 100, targetProgress);

      setAnimatedProgress(Math.floor(progressPercent));

      // Calculate current step based on elapsed time
      const calculatedStep = Math.min(Math.floor(elapsed / stepDuration), steps.length - 1);
      setCurrentStep(calculatedStep);
    },
    startTime ? PROGRESS_UPDATE_INTERVAL : null
  );

  // Reset states based on status
  useEffect(() => {
    if (isReviewPending(status)) {
      setCurrentStep(0);
      setAnimatedProgress(0);
    }
  }, [status]);

  return {
    animatedProgress,
    currentStep,
    currentStepText: steps[currentStep] || steps[0],
  };
}
