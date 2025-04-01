
"use client";

import { useState, useCallback } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onUpload: (file: File) => void;
  className?: string;
}

export const UploadDropzone = ({
  accept = { "image/*": [] },
  maxFiles = 1,
  maxSize = 8 * 1024 * 1024, // 8MB
  onUpload,
  className,
}: UploadDropzoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragEnter = useCallback(() => {
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);

      const files = Array.from(e.dataTransfer.files);

      if (files.length > maxFiles) {
        setError(`You can only upload ${maxFiles} file${maxFiles === 1 ? "" : "s"} at a time.`);
        return;
      }

      const invalidFiles = files.filter(file => !Object.keys(accept).some(type => {
        if (type.endsWith("/*")) {
          const mainType = type.split("/")[0];
          return file.type.startsWith(`${mainType}/`);
        }
        return accept[type].includes(file.type);
      }));

      if (invalidFiles.length > 0) {
        setError("Some files have an invalid format.");
        return;
      }

      const oversizedFiles = files.filter(file => file.size > maxSize);

      if (oversizedFiles.length > 0) {
        setError(`Some files exceed the ${maxSize / (1024 * 1024)}MB size limit.`);
        return;
      }

      setError(null);
      
      // Pass the first file to onUpload function
      if (files.length > 0) {
        onUpload(files[0]);
      }
    },
    [accept, maxFiles, maxSize, onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) return;

      const files = Array.from(e.target.files);

      if (files.length > maxFiles) {
        setError(`You can only upload ${maxFiles} file${maxFiles === 1 ? "" : "s"} at a time.`);
        return;
      }

      const oversizedFiles = files.filter(file => file.size > maxSize);

      if (oversizedFiles.length > 0) {
        setError(`Some files exceed the ${maxSize / (1024 * 1024)}MB size limit.`);
        return;
      }

      setError(null);
      
      // Pass the first file to onUpload function
      if (files.length > 0) {
        onUpload(files[0]);
      }
    },
    [maxFiles, maxSize, onUpload]
  );

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "border-2 border-dashed rounded-md cursor-pointer p-6 text-center hover:bg-muted/50 transition-colors",
          isDragActive && "border-primary bg-primary/5",
          error && "border-destructive",
          className
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <div className="flex flex-col items-center justify-center gap-1">
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <div className="flex flex-col items-center justify-center text-sm">
            <p className="font-medium">
              Drag & drop or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {Object.keys(accept).join(", ")} up to {maxSize / (1024 * 1024)}MB
            </p>
          </div>
        </div>
        <input
          id="fileInput"
          type="file"
          accept={Object.keys(accept).join(",")}
          className="hidden"
          onChange={handleFileInputChange}
          multiple={maxFiles > 1}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
