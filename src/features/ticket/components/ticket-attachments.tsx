"use client";

import { useState, useEffect } from "react";
import {
  LucideLoader2,
  LucideAlertOctagon,
  LucideUploadCloud,
  LucidePaperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/spinner";
import { FileAttachmentUpload } from "./file-attachment-upload";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AttachmentItem } from "./attachment-item";

// Define the attachment type
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

type TicketAttachmentsProps = {
  ticketId: string;
  isDetail?: boolean;
  userId?: string;
  isAdmin?: boolean;
};

export const TicketAttachments = ({
  ticketId,
  isDetail = true,
  userId,
  isAdmin,
}: TicketAttachmentsProps) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Fetch attachments when component mounts
  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/tickets/${ticketId}/attachments`);

        if (!response.ok) {
          throw new Error("Failed to fetch attachments");
        }

        const data = await response.json();

        // Handle different possible API response formats
        if (data && data.attachments && Array.isArray(data.attachments)) {
          // API returns { success: true, attachments: [...] }
          setAttachments(data.attachments);
        } else if (Array.isArray(data)) {
          // API directly returns an array
          setAttachments(data);
        } else {
          // Unexpected format
          console.warn("API did not return expected array format:", data);
          setAttachments([]);
        }
      } catch (err) {
        console.error("Error fetching attachments:", err);
        setError("Failed to load attachments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttachments();
  }, [ticketId]);

  const handleUploadComplete = (newAttachment: Attachment) => {
    setAttachments((prev) => [newAttachment, ...prev]);
    toast.success("File uploaded successfully");
    setIsOpen(true); // Open the attachment list after upload
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const response = await fetch(
        `/api/tickets/${ticketId}/attachments?id=${attachmentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete attachment");
      }

      // Remove the deleted attachment from state
      setAttachments((prev) =>
        prev.filter((attachment) => attachment.id !== attachmentId)
      );

      return {
        success: true,
        message: "Anexo excluído com sucesso",
        fieldErrors: {},
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error deleting attachment:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Falha ao excluir o anexo",
        fieldErrors: {},
        timestamp: Date.now(),
      };
    }
  };

  if (!isDetail) return null;

  return (
    <div className="mt-6 w-full">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <LucidePaperclip className="mr-2 h-5 w-5 text-primary" />
            Anexos
            {attachments.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({attachments.length})
              </span>
            )}
          </h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? "Fechar anexos" : "Abrir anexos"}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-4">
          {/* Upload component */}
          <div className="mb-4">
            <FileAttachmentUpload
              ticketId={ticketId}
              onUploadComplete={handleUploadComplete}
            />
          </div>

          <Separator className="my-4" />

          {/* Attachments list */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                <LucideAlertOctagon className="h-10 w-10 mx-auto mb-2 text-destructive" />
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : attachments.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg border-muted/30">
                <LucideUploadCloud className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum arquivo anexado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Envie arquivos clicando no botão acima
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {attachments.map((attachment) => {
                  // Determine if user can delete this attachment
                  const canDelete =
                    user?.role === "ADMIN" || attachment.userId === user?.id;

                  return (
                    <AttachmentItem
                      key={attachment.id}
                      attachment={attachment}
                      canDelete={canDelete}
                      onDelete={handleDeleteAttachment}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
