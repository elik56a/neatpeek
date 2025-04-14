"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useFileExport } from "@/hooks/use-file-export";
import { 
  prepareDesignReviewExportData, 
  getDesignReviewExportHeaders,
  generateExportFilename
} from "../../utils/export-utils";
import { DesignAnalysisResult, DesignReviewExportOptions } from "../../types";

interface ExportButtonProps {
  result: DesignAnalysisResult;
  figmaFileName?: string;
  className?: string;
}

/**
 * Button component for exporting design review results
 */
export function ExportButton({ result, figmaFileName, className }: ExportButtonProps) {
  const { exportToCsv } = useFileExport();

  const handleExport = () => {
    // Prepare data for export
    const exportData = prepareDesignReviewExportData(result);
    const headers = getDesignReviewExportHeaders();
    
    // Configure export options
    const exportOptions: DesignReviewExportOptions = {
      fileName: "design_review_report",
      fileType: "csv",
      includeTimestamp: true,
      includeFigmaFileName: !!figmaFileName
    };
    
    // Generate dynamic filename
    const filename = generateExportFilename(exportOptions, figmaFileName);
    
    // Export to CSV
    exportToCsv(exportData, headers, {
      fileName: filename,
      fileType: exportOptions.fileType
    });
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleExport}
      className={className}
    >
      <FileDown className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}
