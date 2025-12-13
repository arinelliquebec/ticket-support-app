"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import { LucideTicket, LucideLoader } from "lucide-react";
import { HookFormTicket } from "@/components/hook-form-ticket";
import { hookFormTicketAction } from "@/actions/hook-form-ticket-action";
import { ticketSchema } from "@/validations/ticket-schema";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/spinner";

// Example categories (replace with data from your API)
const demoCategories = [
  { id: "1", name: "Hardware", color: "#60A5FA" },
  { id: "2", name: "Software", color: "#34D399" },
  { id: "3", name: "Network", color: "#A78BFA" },
  { id: "4", name: "Other", color: "#9CA3AF" },
];

type EditTicketPageProps = {
  ticketId: string;
};

export default function EditTicketFormPage({ ticketId }: EditTicketPageProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch ticket data on component mount
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tickets/${ticketId}`);

        if (!response.ok) {
          throw new Error(response.statusText || "Failed to fetch ticket");
        }

        const data = await response.json();
        setTicket(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ticket");
        console.error("Error fetching ticket:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId]);

  // Handle form submission
  const handleSubmit = async (data: z.infer<typeof ticketSchema>) => {
    setIsSubmitting(true);
    try {
      // Add the ticket ID to the form data for editing
      const formDataWithId = {
        ...data,
        id: ticketId,
      };

      // Submit the form data to the server action
      return await hookFormTicketAction(formDataWithId);
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

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-6xl mx-auto w-full px-4 pb-12">
      <div className="bg-gradient-to-r from-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
        <Heading
          title="Edit Ticket with React Hook Form"
          description="Edit an existing ticket with powerful validation"
          icon={<LucideTicket className="h-8 w-8 text-primary" />}
        />
      </div>

      <div className="mt-8">
        {ticket && (
          <HookFormTicket
            ticket={ticket}
            categories={demoCategories}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      <div className="mt-4 p-6 bg-secondary/10 rounded-lg border border-muted/30">
        <h2 className="text-xl font-bold mb-4">
          How This Implementation Works
        </h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Fetches existing ticket data and pre-populates the form</li>
          <li>
            Uses the same form component for both create and edit operations
          </li>
          <li>Preserves the ticket ID during form submission</li>
          <li>Handles loading states and errors appropriately</li>
          <li>
            Validates the form data identically in both create and edit modes
          </li>
        </ul>
      </div>
    </div>
  );
}
