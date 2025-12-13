import { notFound, redirect } from "next/navigation";
import { getTicket } from "@/features/ticket/queries/get-ticket";
import { getAuth } from "@/features/auth/queries/get-auth";
import { isOwner } from "@/features/auth/utils/is-owner";
import { FixedTicketForm } from "@/components/fixed-ticket-form";
import { getCategories } from "@/features/category/actions";

type TicketEditPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

const FixedTicketEditPage = async ({ params }: TicketEditPageProps) => {
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

  // Fetch categories from the database
  const categories = await getCategories();

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-10">
      <div className="w-full max-w-2xl px-4">
        <FixedTicketForm ticket={ticket} existingCategories={categories} />
      </div>
    </div>
  );
};

export default FixedTicketEditPage;
