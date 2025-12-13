// src/app/tickets/page.tsx
// This is a Server Component - Fixed for Next.js 15

import { Suspense } from "react";
import { LucideTicket } from "lucide-react";
import { Heading } from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { getTickets } from "@/features/ticket/queries/get-tickets";
import { InfiniteTicketList } from "@/features/ticket/components/infinite-ticket-list";
import { EnhancedTicketForm } from "@/features/ticket/components/enhanced-ticket-form";
import { getCategories } from "@/features/category/actions";
import { getAuth } from "@/features/auth/queries/get-auth";
import { CreateTicketAuthPrompt } from "@/features/ticket/components/create-ticket-auth-prompt";
import { TicketFiltersWithUrl } from "@/features/ticket/components/ticket-filters";
import { Card } from "@/components/ui/card";
import { TicketsClientWrapper } from "./client-wrapper"; // Import the client wrapper
import { ExportTicketsButton } from "@/features/ticket/components/export-tickets-button";

// Define SearchParams type for the page props
type SearchParams = {
  page?: string;
  pageSize?: string;
  search?: string;
  status?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  filial?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: string;
};

interface TicketsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  // Await searchParams before using it (Next.js 15 requirement)
  const params = await searchParams;

  // Configuração para scroll infinito
  const pageSize = 10; // Carregar 10 tickets por vez para scroll infinito

  // Other filters - use directly without additional property access
  const {
    search,
    status,
    categoryId,
    dateFrom,
    dateTo,
    filial,
    priority,
    sortBy,
    sortOrder,
  } = params;

  // Buscar tickets iniciais para scroll infinito
  const initialTickets = await getTickets({
    page: 0,
    size: pageSize,
    search,
    status,
    categoryId,
    dateFrom,
    dateTo,
    filial,
    priority,
    sortBy,
    sortOrder,
  });

  // Fetch categories for the ticket form and filters
  const categories = await getCategories();

  // Check if user is authenticated
  const { user } = await getAuth();

  return (
    <TicketsClientWrapper>
      <div className="flex-1 flex flex-col gap-y-8 max-w-6xl mx-auto w-full px-4 pb-12">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
          <Heading
            title="Gerenciamento de Tickets"
            description="Acompanhe e gerencie seus tickets de suporte."
            icon={<LucideTicket className="h-8 w-8 text-primary" />}
          />
        </div>

        {/* New Ticket Form Section with card design */}
        <section id="new" className="scroll-mt-24">
          {" "}
          {/* Increased scroll margin */}
          {user ? (
            <EnhancedTicketForm categories={categories} />
          ) : (
            <CreateTicketAuthPrompt />
          )}
        </section>

        {/* Tickets List Section */}
        <section className="flex flex-col gap-y-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold">Seus Tickets</h2>

            {/* Debug current status filter */}
            {status && (
              <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 p-2 text-xs rounded">
                Status filtrado pelo URL: "{status}"
              </div>
            )}

            {/* Filters Component */}
            <Card className="w-full md:w-auto p-4 shadow-sm border-muted/20">
              <TicketFiltersWithUrl categories={categories} />
            </Card>
          </div>

          <ExportTicketsButton />

          <Suspense fallback={<Spinner />}>
            <InfiniteTicketList
              initialTickets={initialTickets.list}
              initialHasMore={initialTickets.metadata.hasNextPage}
              filters={{
                search,
                status,
                categoryId,
                dateFrom,
                dateTo,
                filial,
                sortBy,
                sortOrder,
              }}
              pageSize={pageSize}
            />
          </Suspense>
        </section>
      </div>
    </TicketsClientWrapper>
  );
}
