import { useState } from "react";
import { FileUploader } from "@/features/brand-setup/components/FileUploader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DesignUploaderProps {
  designsReviewId: string;
  onUploadComplete?: () => void;
}

export function DesignUploader({ designsReviewId, onUploadComplete }: DesignUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileRemoved = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("designsReviewId", designsReviewId);

      // Add each file to the form data
      selectedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const response = await fetch("/api/design-review/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload files");
      }

      const designs = await response.json();
      toast.success(`Successfully uploaded ${designs.length} design(s)`);
      
      // Clear selected files
      setSelectedFiles([]);
      
      // Call the completion callback if provided
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUploader
        accept="image/*"
        maxFiles={10}
        maxSize={10 * 1024 * 1024} // 10MB
        onFilesSelected={handleFilesSelected}
        selectedFiles={selectedFiles}
        onFileRemoved={handleFileRemoved}
      />
      
      {selectedFiles.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Upload Designs"}
        </Button>
      )}
    </div>
  );
} 