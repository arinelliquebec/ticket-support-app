import { redirect } from "next/navigation";
import { getAuth } from "@/features/auth/queries/get-auth";
import { FixedTicketForm } from "@/components/fixed-ticket-form";
import { Heading } from "@/components/heading";
import { LucideTicketPlus } from "lucide-react";
import { getCategories } from "@/features/category/actions";

export default async function FixedNewTicketPage() {
  // Check authentication
  const { user } = await getAuth();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch actual categories from the database
  const categories = await getCategories();

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-6xl mx-auto w-full px-4 pb-12">
      <div className="bg-gradient-to-r from-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
        <Heading
          title="Criar Novo Ticket"
          description="Preencha os detalhes para criar um novo ticket de suporte"
          icon={<LucideTicketPlus className="h-8 w-8 text-primary" />}
        />
      </div>

      <div className="mt-8">
        <FixedTicketForm existingCategories={categories} />
      </div>
    </div>
  );
}
