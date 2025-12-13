"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { LucideCheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type AdminCompletionInfoProps = {
  ticketId: string;
  status: string;
};

/**
 * This component shows which admin completed a ticket and when
 * Place it next to your ticket status in the ticket list or detail view
 */
export const AdminCompletionInfo = ({
  ticketId,
  status,
}: AdminCompletionInfoProps) => {
  const [adminName, setAdminName] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch for CONCLUÍDO tickets
    if (status !== "CONCLUÍDO") return;

    const fetchCompletionInfo = async () => {
      setIsLoading(true);
      try {
        // Try to fetch comments for this ticket
        const response = await fetch(`/api/tickets/${ticketId}/comments`);

        if (!response.ok) {
          console.error(`Failed to fetch comments: ${response.status}`);
          return;
        }

        const comments = await response.json();

        // Look for a system comment that indicates ticket completion
        // Format: "Ticket marked as CONCLUÍDO by admin: {username}"
        // Or older format: "Ticket marcado como Concluído por: {username}"
        const completionComment = comments.find(
          (comment: any) =>
            comment.content.includes("CONCLUÍDO by admin") ||
            comment.content.includes("marcado como Concluído por")
        );

        if (completionComment) {
          // Try to extract admin name from the comment
          let extractedName = null;

          // Try newer format first
          const newFormatMatch = completionComment.content.match(
            /CONCLUÍDO by admin: (.+)$/
          );
          if (newFormatMatch && newFormatMatch[1]) {
            extractedName = newFormatMatch[1];
          } else {
            // Try older format
            const oldFormatMatch = completionComment.content.match(
              /marcado como Concluído por: (.+)$/
            );
            if (oldFormatMatch && oldFormatMatch[1]) {
              extractedName = oldFormatMatch[1];
            }
          }

          // If we couldn't extract from content, use the username from comment
          const adminName =
            extractedName || completionComment.user?.username || "Unknown";

          setAdminName(adminName);
          setCompletedAt(new Date(completionComment.createdAt));
        }
      } catch (error) {
        console.error("Error fetching completion info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletionInfo();
  }, [ticketId, status]);

  // Don't render anything if not completed or no admin info
  if (status !== "CONCLUÍDO" || !adminName || isLoading) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center text-xs text-green-600 dark:text-green-400 hover:underline cursor-help">
            <LucideCheckCircle className="h-3 w-3 mr-1" />
            <span>Concluído por {adminName}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {completedAt ? (
            <p>
              Concluído em{" "}
              {format(completedAt, "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          ) : (
            <p>Data de conclusão não disponível</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
