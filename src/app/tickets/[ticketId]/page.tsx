import { notFound } from "next/navigation";
import { TicketItem } from "@/features/ticket/components/ticket-item";
import { getTicket } from "@/features/ticket/queries/get-ticket";
import { getAuth } from "@/features/auth/queries/get-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LucidePaperclip,
  LucideMessageSquare,
  LucideArrowLeft,
} from "lucide-react";
import { Comments } from "@/features/comment/components/comments";
import { getComments } from "@/features/comment/queries/get-comments";
import { Badge } from "@/components/ui/badge";
import { TicketCompletionInfo } from "@/features/ticket/components/ticket-completion-info";
import { TicketAttachments } from "@/features/ticket/components/ticket-attachments";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ticketsPath } from "@/paths";
import { markTicketAsViewed } from "@/features/ticket/actions/mark-ticket-viewed";

interface TicketPageProps {
  params: Promise<{
    ticketId: string;
  }>;
}

export default async function TicketPage({ params }: TicketPageProps) {
  // Critical: Await params resolution
  const resolvedParams = await params;
  const { ticketId } = resolvedParams;

  // Defensive programming: Validate ticketId
  if (!ticketId || typeof ticketId !== "string") {
    notFound();
  }

  try {
    const [ticket, { user }] = await Promise.all([
      getTicket(ticketId),
      getAuth(),
    ]);

    if (!ticket || !user) {
      notFound();
    }

    // Enhanced ticket with comment count
    const ticketWithComments = {
      ...ticket,
      _count: {
        ...ticket._count,
        comments: 0,
      },
    };

    const paginatedComments = await getComments(ticketId);
    const isAdmin = user?.role === "ADMIN";

    // Mark ticket as viewed by admin (fire and forget)
    if (isAdmin && !ticket.viewedByAdmin) {
      markTicketAsViewed(ticketId).catch(console.error);
    }

    return (
      <div className="flex flex-col gap-6 animate-fade-from-top max-w-3xl mx-auto w-full px-4">
        {/* Breadcrumb / Back Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 hover:bg-primary/10 transition-colors"
          >
            <Link href={ticketsPath()}>
              <LucideArrowLeft className="h-4 w-4" />
              Voltar para Tickets
            </Link>
          </Button>
        </div>

        <TicketItem ticket={ticketWithComments} isDetail />

        {ticket.status === "CONCLUÍDO" && (
          <TicketCompletionInfo ticketId={ticketId} />
        )}

        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <LucideMessageSquare className="h-4 w-4" />
              Descrição
              {paginatedComments.list.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 text-xs">
                  {paginatedComments.list.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="attachments"
              className="flex items-center gap-2"
            >
              <LucidePaperclip className="h-4 w-4" />
              Anexos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="pt-4">
            <Comments
              ticketId={ticketId}
              paginatedComments={paginatedComments}
            />
          </TabsContent>

          <TabsContent value="attachments" className="pt-4">
            <Card className="border-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Arquivos anexados</CardTitle>
                <CardDescription>
                  Ver mensagem e anexos relacionados ao ticket.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TicketAttachments ticketId={ticketId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error("Ticket page error:", error);
    notFound();
  }
}
