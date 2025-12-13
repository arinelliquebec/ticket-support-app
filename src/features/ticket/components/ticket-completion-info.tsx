"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { LucideCheckCircle, LucideUser, LucideCalendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ptBR } from "date-fns/locale";

type TicketCompletionInfoProps = {
  ticketId: string;
};

type CompletionInfo = {
  adminName: string;
  completedAt: Date;
};

export const TicketCompletionInfo = ({
  ticketId,
}: TicketCompletionInfoProps) => {
  const [completionInfo, setCompletionInfo] = useState<CompletionInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCompletionInfo = async () => {
      setIsLoading(true);
      try {
        // Find the comment that mentions ticket completion
        const response = await fetch(`/api/tickets/${ticketId}/comments`);
        if (!response.ok) throw new Error("Failed to fetch comments");

        const comments = await response.json();

        // Find the most recent comment that mentions ticket completion
        const completionComment = comments
          .filter((comment: any) =>
            comment.content.includes("marked as CONCLUÍDO by admin")
          )
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

        if (completionComment) {
          // Extract admin name from comment
          const adminName =
            completionComment.content.match(/admin: (.+)$/)?.[1] ||
            completionComment.user.username;

          setCompletionInfo({
            adminName,
            completedAt: new Date(completionComment.createdAt),
          });
        }
      } catch (error) {
        console.error("Error fetching completion info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletionInfo();
  }, [ticketId]);

  if (isLoading) return null;
  if (!completionInfo) return null;

  return (
    <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 shadow-sm">
      <CardContent className="pt-6 pb-4">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
          <LucideCheckCircle className="h-5 w-5" />
          <h3 className="font-medium">Ticket Completed</h3>
        </div>

        <div className="space-y-2 pl-7 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <LucideUser className="h-4 w-4" />
            <span>
              Completed by <strong>{completionInfo.adminName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <LucideCalendar className="h-4 w-4" />
            <span>
              {format(completionInfo.completedAt, "dd/MM/yyyy 'at' HH:mm", {
                locale: ptBR,
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
