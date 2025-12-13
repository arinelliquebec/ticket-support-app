import { notFound, redirect } from "next/navigation";
import { getTicket } from "@/features/ticket/queries/get-ticket";
import { getAuth } from "@/features/auth/queries/get-auth";
import { isOwner } from "@/features/auth/utils/is-owner";
import { ImprovedTicketForm } from "@/components/improved-ticket-form";
import { improvedUpsertTicket } from "@/actions/improved-upsert-ticket";

type TicketEditPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

const ImprovedTicketEditPage = async ({ params }: TicketEditPageProps) => {
  const { ticketId } = await params;
  const ticket = await getTicket(ticketId);

  if (!ticket) {
    notFound();
  }

  // Get authenticated user and check permissions
  const { user } = await getAuth();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is admin or the ticket owner
  const isAdmin = user.role === "ADMIN";
  const isTicketOwner = isOwner(user, ticket);

  // If not admin and not the owner, redirect to access denied
  if (!isAdmin && !isTicketOwner) {
    redirect("/access-denied?reason=ticketEdit");
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl px-4">
        <ImprovedTicketForm
          ticket={ticket}
          onSubmitAction={improvedUpsertTicket.bind(null, ticketId)}
        />
      </div>
    </div>
  );
};

export default ImprovedTicketEditPage;
