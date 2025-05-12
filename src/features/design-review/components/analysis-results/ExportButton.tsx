"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useFileExport } from "@/hooks/use-file-export";
import {
  prepareDesignReviewExportData,
  getDesignReviewExportHeaders,
  generateExportFilename,
} from "../../utils/export-utils";
import { DesignReviewExportOptions, ExportFileType, DesignsReview } from "../../types";

interface ExportButtonProps {
  designsReview: DesignsReview;
  figmaFileName?: string;
  className?: string;
}

/**
 * Button component for exporting design review results
 */
export function ExportButton({ designsReview, figmaFileName, className }: ExportButtonProps) {
  const { exportToCsv } = useFileExport();

  const handleExport = () => {
    // Prepare data for export
    const exportData = prepareDesignReviewExportData(designsReview);
    const headers = getDesignReviewExportHeaders();

    // Configure export options
    const exportOptions: DesignReviewExportOptions = {
      fileName: "design_review_report",
      fileType: ExportFileType.CSV,
      includeTimestamp: true,
      includeFigmaFileName: !!figmaFileName,
    };

    // Generate dynamic filename
    const filename = generateExportFilename(exportOptions, figmaFileName);

    // Export to CSV
    exportToCsv(exportData, headers, {
      fileName: filename,
      fileType: exportOptions.fileType,
    });
  };

  return (
    <Button variant="outline" onClick={handleExport} className={className}>
      <FileDown className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}
