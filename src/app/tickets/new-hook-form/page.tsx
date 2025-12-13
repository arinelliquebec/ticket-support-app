"use client";

import { useState } from "react";
import { Heading } from "@/components/heading";
import { LucideTicketPlus } from "lucide-react";
import { HookFormTicket } from "@/components/hook-form-ticket";
import { hookFormTicketAction } from "@/actions/hook-form-ticket-action";
import { ticketSchema } from "@/validations/ticket-schema";
import { z } from "zod";

// Example categories (replace with data from your API)
const demoCategories = [
  { id: "1", name: "Hardware", color: "#60A5FA" },
  { id: "2", name: "Software", color: "#34D399" },
  { id: "3", name: "Network", color: "#A78BFA" },
  { id: "4", name: "Other", color: "#9CA3AF" },
];

export default function TicketFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (data: z.infer<typeof ticketSchema>) => {
    setIsSubmitting(true);
    try {
      // Submit the form data to the server action
      return await hookFormTicketAction(data);
    } catch (error) {
      console.error("Error submitting form:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-6xl mx-auto w-full px-4 pb-12">
      <div className="bg-gradient-to-r from-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
        <Heading
          title="Create Ticket with React Hook Form"
          description="Create a new ticket with powerful validation"
          icon={<LucideTicketPlus className="h-8 w-8 text-primary" />}
        />
      </div>

      <div className="mt-8">
        <HookFormTicket
          categories={demoCategories}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="mt-4 p-6 bg-secondary/10 rounded-lg border border-muted/30">
        <h2 className="text-xl font-bold mb-4">
          How This Implementation Works
        </h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Uses React Hook Form with Zod resolver for validation</li>
          <li>
            Ensures consistent handling of nullable fields (categoryId, filial)
          </li>
          <li>
            Properly initializes form fields in both create and edit modes
          </li>
          <li>Provides real-time validation feedback to users</li>
          <li>Handles server-side validation errors consistently</li>
          <li>Transforms form data correctly before sending to the server</li>
          <li>Preserves form values after validation errors occur</li>
        </ul>
      </div>
    </div>
  );
}
