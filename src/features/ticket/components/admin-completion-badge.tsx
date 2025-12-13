"use client";

import { useEffect, useState } from "react";
import { LucideCheckCircle, LucideUser, LucideCalendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type AdminCompletionBadgeProps = {
  ticketId: string;
  status: string;
  variant?: "badge" | "detailed" | "compact";
  className?: string;
};

export const AdminCompletionBadge = ({
  ticketId,
  status,
  variant = "badge",
  className = "",
}: AdminCompletionBadgeProps) => {
  const [adminName, setAdminName] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch for CONCLUÍDO tickets
    if (status !== "CONCLUÍDO") return;

    const fetchCompletionInfo = async () => {
      setIsLoading(true);
      try {
        // Fetch comments for this ticket
        const response = await fetch(`/api/tickets/${ticketId}/comments`);

        if (!response.ok) {
          console.error(`Failed to fetch comments: ${response.status}`);
          return;
        }

        const comments = await response.json();

        // Look for a system comment that indicates ticket completion
        // Pattern: "Ticket marcado como CONCLUÍDO pelo administrador: {username}"
        const completionPatterns = [
          /marcado como CONCLUÍDO pelo administrador: (.+)$/,
          /marcado como Concluído por: (.+)$/,
          /Ticket concluído por (.+)$/,
          /Ticket marked as CONCLUÍDO by admin: (.+)$/,
        ];

        const completionComment = comments.find((comment: any) =>
          completionPatterns.some((pattern) => pattern.test(comment.content))
        );

        if (completionComment) {
          // Try to extract admin name from the comment using the patterns
          let extractedName = null;

          for (const pattern of completionPatterns) {
            const match = completionComment.content.match(pattern);
            if (match && match[1]) {
              // Extract name and clean up any datetime that might be included
              extractedName = match[1].split("(")[0].trim();
              break;
            }
          }

          // If we couldn't extract from content, use the comment author
          const adminName =
            extractedName ||
            completionComment.user?.username ||
            "Administrador";

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

  // Don't render anything if not completed or no admin info available
  if (status !== "CONCLUÍDO" || !adminName || isLoading) {
    return null;
  }

  // Badge variant - compact for ticket lists
  if (variant === "badge") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 cursor-help ${className}`}
            >
              <LucideCheckCircle className="h-3.5 w-3.5 mr-1.5" />
              <span className="font-medium">Concluído por {adminName}</span>
            </Badge>
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
  }

  // Compact variant - for inline display
  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center text-xs text-green-600 dark:text-green-400 cursor-help ${className}`}
            >
              <LucideCheckCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="truncate">Concluído por {adminName}</span>
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
  }

  // Detailed variant - for ticket details page
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 py-1.5"
        >
          <LucideCheckCircle className="h-4 w-4 mr-2" />
          <span className="font-medium">Ticket Concluído</span>
        </Badge>
      </div>

      <div className="bg-green-50/50 dark:bg-green-900/10 rounded-md p-4 border border-green-200 dark:border-green-800/30">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <LucideUser className="h-4 w-4 text-green-700 dark:text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-400">
                Concluído por:
              </p>
              <p className="text-sm">{adminName}</p>
            </div>
          </div>

          {completedAt && (
            <div className="flex items-start gap-2">
              <LucideCalendar className="h-4 w-4 text-green-700 dark:text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-400">
                  Data de conclusão:
                </p>
                <p className="text-sm">
                  {format(completedAt, "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
