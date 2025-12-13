// src/app/fixed-ticket/page.tsx
import { FixedTicketForm } from "@/components/fixed-ticket-form";
import { getCategories } from "@/features/category/actions";
import { Heading } from "@/components/heading";
import { LucideTicket } from "lucide-react";

export default async function FixedTicketPage() {
  // Fetch categories for the form
  const categories = await getCategories();

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-6xl mx-auto w-full px-4 pb-12">
      <div className="bg-gradient-to-r from-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
        <Heading
          title="Fixed Ticket Creation"
          description="Create tickets with proper handling of optional fields"
          icon={<LucideTicket className="h-8 w-8 text-primary" />}
        />
      </div>

      <div className="mt-8">
        <FixedTicketForm categories={categories} />
      </div>

      <div className="mt-4 p-6 bg-secondary/10 rounded-lg border border-muted/30">
        <h2 className="text-xl font-bold mb-4">
          What This Fixed Implementation Does
        </h2>
        <p className="mb-3">
          This implementation addresses the foreign key constraint error by:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            Properly converting empty or "none" values to explicit{" "}
            <code>null</code> values in the database
          </li>
          <li>
            Conducting proper validation before attempting to create the ticket
          </li>
          <li>
            Using consistent handling for both the <code>categoryId</code> and{" "}
            <code>filial</code> fields
          </li>
          <li>
            Adding detailed debug logging to help diagnose any further issues
          </li>
          <li>Implementing both client-side and server-side validation</li>
        </ul>
        <p className="mt-4 text-muted-foreground">
          This approach ensures that data sent to the database always matches
          the expected format, preventing foreign key constraint violations.
        </p>
      </div>
    </div>
  );
}
