"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LucideFile,
  LucideImage,
  LucideFileText,
  LucideFileCog,
  LucideDownload,
  LucideExternalLink,
  LucideTrash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";

type Attachment = {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  createdAt: string;
  userId: string;
  ticketId: string;
  user: {
    username: string;
  };
};

type AttachmentItemProps = {
  attachment: Attachment;
  canDelete: boolean;
  onDelete: (attachmentId: string) => Promise<any>;
};

export const AttachmentItem = ({
  attachment,
  canDelete,
  onDelete,
}: AttachmentItemProps) => {
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Get appropriate icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <LucideImage className="h-5 w-5 text-blue-500" />;
    } else if (
      fileType === "application/pdf" ||
      fileType.includes("document") ||
      fileType.includes("text/")
    ) {
      return <LucideFileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
      return <LucideFileCog className="h-5 w-5 text-green-500" />;
    } else {
      return <LucideFile className="h-5 w-5 text-gray-500" />;
    }
  };

  // Check if the attachment preview can be displayed
  const canPreview = (fileType: string) => {
    return fileType.startsWith("image/") || fileType === "application/pdf";
  };

  // Handle delete with confirmation dialog
  const [deleteButton, deleteDialog] = useConfirmDialog({
    title: "Delete Attachment",
    description:
      "Are you sure you want to delete this file? This action cannot be undone.",
    action: async () => {
      try {
        const result = await onDelete(attachment.id);
        if (result.success) {
          toast.success("Attachment deleted successfully");
        }
        return result;
      } catch (error) {
        toast.error("Failed to delete attachment");
        return {
          status: "ERROR" as const,
          message: "Failed to delete attachment",
          fieldErrors: {},
          timestamp: Date.now(),
        };
      }
    },
    trigger: (
      <Button variant="outline" size="icon" className="h-8 w-8">
        <LucideTrash className="h-4 w-4 text-destructive" />
      </Button>
    ),
  });

  return (
    <Card
      key={attachment.id}
      className="p-3 flex items-center justify-between hover:bg-muted/10 transition-colors group"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-muted/20 rounded-lg">
          {getFileIcon(attachment.fileType)}
        </div>

        <div className="overflow-hidden">
          <h5 className="font-medium truncate max-w-[240px] sm:max-w-xs">
            {attachment.fileName}
          </h5>
          <div className="flex items-center text-xs text-muted-foreground">
            <span>{formatFileSize(attachment.fileSize)}</span>
            <span className="mx-1">•</span>
            <span>
              Uploaded by {attachment.user.username} on{" "}
              {format(new Date(attachment.createdAt), "MMM d, yyyy", {
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canPreview(attachment.fileType) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => window.open(attachment.fileUrl, "_blank")}
                >
                  <LucideExternalLink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview in new tab</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <a
                  href={attachment.fileUrl}
                  download={attachment.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LucideDownload className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {canDelete && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{deleteButton}</TooltipTrigger>
              <TooltipContent>
                <p>Delete file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {deleteDialog}
      </div>
    </Card>
  );
};
