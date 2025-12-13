// src/features/auth/components/user-avatar-manager.tsx
"use client";

import { useState, useEffect } from "react";
import { AvatarUpload } from "@/components/avatar-upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  LucideImage,
  LucideLoader2,
  LucideAlertCircle,
  LucideCheck,
  LucideRefreshCw,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const UserAvatarManager = () => {
  const { user, isFetched } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  if (!isFetched || !user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const handleImageSelected = (file: File) => {
    setSelectedImage(file);
    setUploadError(null);
    setUploadSuccess(false);

    // Create a preview URL for the selected image
    const imageUrl = URL.createObjectURL(file);
    setAvatarUrl(imageUrl);
  };

  // Simulates upload progress for better UX
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

  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    // Start progress animation
    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      // Complete progress bar
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();

      // Update the avatar URL in local state
      setAvatarUrl(data.avatarUrl);
      setUploadSuccess(true);

      toast.success("Avatar updated successfully!");

      // Wait a moment to show success state before refreshing
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Error uploading avatar"
      );
      toast.error("Failed to upload avatar");
    } finally {
      // Give a moment to show 100% progress or error
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <LucideImage className="mr-2 h-5 w-5 text-primary" />
          Profile Photo
        </CardTitle>
        <CardDescription>
          Upload a profile photo to personalize your account
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4">
        {/* Show current avatar if available */}
        {avatarUrl && !selectedImage && (
          <div className="mb-2">
            {/* Tamanho do avatar aumentado para h-36 w-36 (era h-24 w-24) */}
            <Avatar className="h-36 w-36">
              <AvatarImage src={avatarUrl} alt={user.username} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <AvatarUpload
          currentAvatarUrl={avatarUrl}
          username={user.username}
          onImageSelected={handleImageSelected}
        />

        {selectedImage && !isUploading && !uploadSuccess && (
          <div className="text-sm text-muted-foreground">
            {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
          </div>
        )}

        {isUploading && (
          <div className="w-full space-y-4">
            <Progress value={uploadProgress} className="h-2" />
            <div className="flex items-center justify-center">
              <LucideLoader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Uploading... {Math.round(uploadProgress)}%
              </span>
            </div>
          </div>
        )}

        {uploadError && (
          <Alert variant="destructive" className="w-full">
            <LucideAlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {uploadSuccess && (
          <Alert className="w-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200">
            <LucideCheck className="h-4 w-4 mr-2" />
            <AlertDescription>Avatar updated successfully!</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        {uploadSuccess ? (
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-600 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:border-green-800 dark:text-green-400"
          >
            <LucideRefreshCw className="mr-2 h-4 w-4" />
            Atualizar Página
          </Button>
        ) : (
          <Button
            onClick={handleUpload}
            disabled={!selectedImage || isUploading}
            className="bg-primary hover:bg-primary/90"
          >
            {isUploading ? (
              <>
                <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Save Avatar"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
