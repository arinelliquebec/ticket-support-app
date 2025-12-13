import { notFound } from "next/navigation";
import { TicketItem } from "@/features/ticket/components/ticket-item";
import { getTicket } from "@/features/ticket/queries/get-ticket";
import { TicketAttachments } from "@/features/ticket/components/ticket-attachments";
import { getAuth } from "@/features/auth/queries/get-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucidePaperclip, LucideMessageSquare } from "lucide-react";
import { Comments } from "@/features/comment/components/comments";
import { getComments } from "@/features/comment/queries/get-comments";
import { Badge } from "@/components/ui/badge";

type TicketPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

const TicketPage = async ({ params }: TicketPageProps) => {
  const { ticketId } = await params;
  const ticket = await getTicket(ticketId);
  const { user } = await getAuth();

  if (!ticket || !user) {
    notFound();
  }

  // Get comments for the ticket
  const paginatedComments = await getComments(ticketId);

  // Check if user is admin
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 animate-fade-from-top max-w-3xl mx-auto w-full">
      {/* Ticket details */}
      <TicketItem ticket={ticket} isDetail />

      {/* Tabs for comments and attachments */}
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
          <TabsTrigger value="attachments" className="flex items-center gap-2">
            <LucidePaperclip className="h-4 w-4" />
            Anexos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="pt-4">
          <Comments ticketId={ticketId} paginatedComments={paginatedComments} />
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
              <TicketAttachments
                ticketId={ticketId}
                userId={user.id}
                isAdmin={isAdmin}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketPage;
