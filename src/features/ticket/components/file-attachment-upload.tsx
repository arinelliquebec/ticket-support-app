"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LucideUpload,
  LucideFile,
  LucideX,
  LucideLoader2,
  LucideAlertTriangle,
  LucideCheck,
} from "lucide-react";
import { toast } from "sonner";

type FileAttachmentUploadProps = {
  ticketId: string;
  onUploadComplete?: (attachment: any) => void;
};

export const FileAttachmentUpload = ({
  ticketId,
  onUploadComplete,
}: FileAttachmentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate upload progress
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 150);
    return interval;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Reset error state
      setError(null);

      const file = files[0];

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Reset error state
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    // Start progress animation
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`/api/tickets/${ticketId}/attachments`, {
        method: "POST",
        body: formData,
      });

      // Complete the progress bar
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const data = await response.json();

      // Notify success
      toast.success("File uploaded successfully");

      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(data.attachment);
      }

      // Reset the form after a successful upload
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload file"
      );
      toast.error("Failed to upload file");
    } finally {
      // Give a moment to show 100% progress before resetting
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <Alert variant="destructive" className="py-2">
          <LucideAlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all 
                    ${
                      isUploading ? "bg-secondary/20" : "hover:bg-secondary/10"
                    } 
                    ${
                      selectedFile
                        ? "border-primary/30 bg-primary/5"
                        : "border-muted/30"
                    } 
                    ${error ? "border-destructive/30 bg-destructive/5" : ""}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-center">
                <LucideLoader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Enviando... {uploadProgress}%
              </p>
            </div>
          ) : selectedFile ? (
            <div className="w-full space-y-3">
              <div className="flex items-center justify-center">
                <div className="p-3 rounded-full bg-primary/20">
                  <LucideFile className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium truncate max-w-full">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="text-muted-foreground"
                >
                  <LucideX className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  className="bg-primary hover:bg-primary/90"
                >
                  <LucideUpload className="h-4 w-4 mr-1" />
                  Enviar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-full bg-primary/10">
                <LucideUpload className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-base font-medium">
                  Clique aqui ou arraste para importar arquivos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Suporta qualquer arquivo de até 10MB
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                Procurar Arquivo
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
