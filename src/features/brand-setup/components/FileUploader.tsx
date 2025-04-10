"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { FileIcon, Trash2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

interface FileUploaderProps {
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onFileRemoved: (index: number) => void;
  className?: string;
}

export function FileUploader({
  accept,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFilesSelected,
  selectedFiles,
  onFileRemoved,
  className,
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    processFiles(Array.from(files));
  };

  const processFiles = (fileArray: File[]) => {
    setError(null);

    // Check if adding these files would exceed the max files limit
    if (selectedFiles.length + fileArray.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files`);
      return;
    }

    // Check file size
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(`File is too large. Max size is ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Check file type
    if (accept) {
      const acceptedTypes = accept.split(',');
      const invalidFiles = fileArray.filter(file => {
        // For image/* type checks
        if (accept === 'image/*' && !file.type.startsWith('image/')) {
          return true;
        }
        // For specific file types
        return !acceptedTypes.some(type => {
          if (type.includes('*')) {
            const prefix = type.split('*')[0];
            return file.type.startsWith(prefix);
          }
          return file.type === type;
        });
      });

      if (invalidFiles.length > 0) {
        setError(`Invalid file type. Accepted: ${accept}`);
        return;
      }
    }

    onFilesSelected(fileArray);

    // Reset the input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    processFiles(Array.from(files));
  };

  // Format file size
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / 1024 / 1024).toFixed(1)} MB`;
    }
  };

  // Create file preview URL
  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {selectedFiles.length < maxFiles && (
        <div
          className={cn(
            "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            error && "border-destructive"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept={accept}
            multiple={maxFiles > 1}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm font-medium">
              {isDragging ? (
                <p>Drop files here...</p>
              ) : (
                <p>
                  Drag & drop files here, or <span className="text-primary">browse</span>
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {accept === "application/pdf"
                ? "PDF files only"
                : accept === "image/*"
                ? "Image files only (JPG, PNG, GIF)"
                : "Upload files"}
              {maxSize && ` up to ${maxSize / 1024 / 1024}MB`}
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {selectedFiles.length > 0 && (
        <div className={cn(
          "grid gap-4",
          accept === "image/*" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1"
        )}>
          {selectedFiles.map((file, index) => {
            const previewUrl = getFilePreview(file);

            return previewUrl ? (
              // Image preview
              <div key={`${file.name}-${index}`} className="relative group">
                <div className="relative aspect-square rounded-md overflow-hidden border">
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      URL.revokeObjectURL(previewUrl);
                      onFileRemoved(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
              </div>
            ) : (
              // File item (for PDFs and other non-image files)
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onFileRemoved(index)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
