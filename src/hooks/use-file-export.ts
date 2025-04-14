"use client";

import { useState } from "react";
import { useToast } from "./use-toast";

interface UseFileExportOptions {
  fileName?: string;
  fileType?: string;
  mimeType?: string;
}

/**
 * Hook for exporting data to files
 */
export function useFileExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  /**
   * Export data to CSV file
   * @param data Array of objects to export
   * @param headers Object mapping column keys to display names
   * @param options Export options
   */
  const exportToCsv = <T extends Record<string, any>>(
    data: T[],
    headers: Record<string, string>,
    options?: UseFileExportOptions
  ) => {
    const fileName = options?.fileName || "export";
    const fileType = options?.fileType || "csv";
    const mimeType = options?.mimeType || "text/csv;charset=utf-8";

    setIsExporting(true);

    try {
      // Create CSV content
      let csvContent = `data:${mimeType},`;

      // Add headers
      const headerRow = Object.values(headers).join(",");
      csvContent += headerRow + "\n";

      // Add data rows
      data.forEach((item) => {
        const row = Object.keys(headers)
          .map((key) => {
            // Escape quotes and wrap in quotes
            const value = item[key] !== undefined && item[key] !== null ? String(item[key]) : "";
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",");
        csvContent += row + "\n";
      });

      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${fileName}.${fileType}`);
      document.body.appendChild(link);

      // Trigger download
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Complete",
        description: `The data has been exported to ${fileType.toUpperCase()} format.`,
      });

      return true;
    } catch (error) {
      console.error(`Error exporting to ${fileType}:`, error);
      toast({
        title: "Export Failed",
        description: `There was an error exporting the data to ${fileType.toUpperCase()}.`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export raw content to a file
   * @param content Content to export
   * @param options Export options
   */
  const exportRawContent = (
    content: string,
    options?: UseFileExportOptions
  ) => {
    const fileName = options?.fileName || "export";
    const fileType = options?.fileType || "txt";
    const mimeType = options?.mimeType || "text/plain;charset=utf-8";

    setIsExporting(true);

    try {
      // Create blob
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${fileName}.${fileType}`);
      document.body.appendChild(link);

      // Trigger download
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `The data has been exported to ${fileType.toUpperCase()} format.`,
      });

      return true;
    } catch (error) {
      console.error(`Error exporting to ${fileType}:`, error);
      toast({
        title: "Export Failed",
        description: `There was an error exporting the data to ${fileType.toUpperCase()}.`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportToCsv,
    exportRawContent,
  };
}
