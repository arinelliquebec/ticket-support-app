import { notFound, redirect } from "next/navigation";
import { getTicket } from "@/features/ticket/queries/get-ticket";
import { getAuth } from "@/features/auth/queries/get-auth";
import { isOwner } from "@/features/auth/utils/is-owner";
import { getCategories } from "@/features/category/actions";
import { ConsistentTicketForm } from "@/components/consistent-ticket-form";
import { Heading } from "@/components/heading";
import { LucideTicket } from "lucide-react";

interface EditTicketPageProps {
  params: Promise<{
    ticketId: string;
  }>;
}

export default async function EditTicketPage({ params }: EditTicketPageProps) {
  // Await params with error handling
  const resolvedParams = await params.catch(() => null);

  if (!resolvedParams || !resolvedParams.ticketId) {
    notFound();
  }

  const { ticketId } = resolvedParams;

  // Parallel data fetching for performance
  const [ticket, authResult, categories] = await Promise.all([
    getTicket(ticketId),
    getAuth(),
    getCategories(),
  ]);

  if (!ticket) {
    notFound();
  }

  const { user } = authResult;

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = user.role === "ADMIN";
  const isTicketOwner = isOwner(user, ticket);

  if (!isAdmin && !isTicketOwner) {
    redirect("/access-denied?reason=ticketEdit");
  }

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-6xl mx-auto w-full px-4 pb-12">
      <div className="bg-gradient-to-r from-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
        <Heading
          title="Editar Ticket"
          description="Atualize os detalhes do ticket existente"
          icon={<LucideTicket className="h-8 w-8 text-primary" />}
        />
      </div>

      <div className="mt-8">
        <ConsistentTicketForm ticket={ticket} categories={categories} />
      </div>
    </div>
  );
}
