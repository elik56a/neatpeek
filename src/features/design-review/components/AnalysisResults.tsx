"use client";

import { DesignAnalysisResult } from "../types";
import {
  ExportButton,
  RecheckButton,
  AnalysisDetails
} from "./analysis-results";

interface AnalysisResultsProps {
  result: DesignAnalysisResult;
  onRecheck: () => void;
  figmaFileName?: string;
}

/**
 * Main component for displaying design analysis results
 * This component is split into smaller, focused components
 */
export function AnalysisResults({ result, onRecheck, figmaFileName }: AnalysisResultsProps) {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Design Review Results</h2>
        <div className="flex gap-2">
          <ExportButton result={result} figmaFileName={figmaFileName} />
          <RecheckButton onRecheck={onRecheck} />
        </div>
      </div>

      {/* Main content with all the UI elements */}
      <AnalysisDetails result={result} figmaFileName={figmaFileName} />
    </div>
  );
}
