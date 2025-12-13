// src/components/avatar-upload.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LucideUpload, LucideX } from "lucide-react";

type AvatarUploadProps = {
  currentAvatarUrl?: string | null;
  username: string;
  onImageSelected: (file: File) => void;
};

export const AvatarUpload = ({
  currentAvatarUrl,
  username,
  onImageSelected,
}: AvatarUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize preview URL when component mounts or currentAvatarUrl changes
  useEffect(() => {
    if (currentAvatarUrl) {
      setPreviewUrl(currentAvatarUrl);
    }
  }, [currentAvatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Por favor, envie apenas arquivos de imagem.");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call the callback function
    onImageSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className={`relative group cursor-pointer ${
          isDragging ? "ring-2 ring-primary" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <Avatar className="h-24 w-24">
          <AvatarImage src={previewUrl || ""} alt={username} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {getInitials(username)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <LucideUpload className="h-8 w-8 text-white" />
        </div>
        {previewUrl && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClearImage();
            }}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
          >
            <LucideX className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <div className="text-sm text-muted-foreground">
        Arraste uma imagem ou clique para selecionar
      </div>
    </div>
  );
};
