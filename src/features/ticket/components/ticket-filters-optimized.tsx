// src/app/tickets/page.tsx
// This is a Server Component

import { Suspense } from "react";
import { LucideTicket } from "lucide-react";
import { Heading } from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { TicketList } from "@/features/ticket/components/ticket-list";
import { EnhancedTicketForm } from "@/features/ticket/components/enhanced-ticket-form";
import { getCategories } from "@/features/category/actions";
import { getAuth } from "@/features/auth/queries/get-auth";
import { CreateTicketAuthPrompt } from "@/features/ticket/components/create-ticket-auth-prompt";
import { TicketFiltersWithUrl } from "@/features/ticket/components/ticket-filters";
import { Card } from "@/components/ui/card";

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
  sortBy?: string;
  sortOrder?: string;
};

interface TicketsPageProps {
  searchParams: SearchParams;
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  // Correct way to handle searchParams for pagination
  const pageParam = searchParams.page;
  const pageSizeParam = searchParams.pageSize;

  // Parse values safely
  const page = pageParam ? parseInt(pageParam) : 0;
  const pageSize = pageSizeParam ? parseInt(pageSizeParam) : 5;

  // Other filters - use directly without additional property access
  const {
    search,
    status,
    categoryId,
    dateFrom,
    dateTo,
    filial,
    sortBy,
    sortOrder,
  } = searchParams;

  // Fetch categories for the ticket form and filters
  const categories = await getCategories();

  // Check if user is authenticated
  const { user } = await getAuth();

  return (
    <div className="flex-1 flex flex-col gap-y-8 max-w-6xl mx-auto w-full px-4 pb-12">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent -mx-4 -mt-4 px-4 pt-4 pb-6 border-b border-muted/10">
        <Heading
          title="Gerenciamento de Tickets"
          description="Acompanhe e gerencie seus tickets de suporte"
          icon={<LucideTicket className="h-8 w-8 text-primary" />}
        />
      </div>

      {/* New Ticket Form Section with card design */}
      <section id="new" className="scroll-mt-16">
        {user ? (
          <EnhancedTicketForm categories={categories} />
        ) : (
          <CreateTicketAuthPrompt />
        )}
      </section>

      {/* Tickets List Section */}
      <section className="flex flex-col gap-y-6 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold">Your Tickets</h2>

          {/* Filters Component */}
          <Card className="w-full md:w-auto p-4 shadow-sm border-muted/20">
            <TicketFiltersWithUrl categories={categories} />
          </Card>
        </div>

        <Suspense fallback={<Spinner />}>
          <TicketList
            page={page}
            pageSize={pageSize}
            search={search}
            status={status}
            categoryId={categoryId}
            dateFrom={dateFrom}
            dateTo={dateTo}
            filial={filial}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </Suspense>
      </section>
    </div>
  );
}
