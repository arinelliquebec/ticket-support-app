// src/app/tickets/infinite-page.tsx
// Página com scroll infinito otimizado

import { Suspense } from "react";
import { LucideTicket } from "lucide-react";
import { Heading } from "@/components/heading";
import { Spinner } from "@/components/spinner";
import { getCategories } from "@/features/category/actions";
import { getAuth } from "@/features/auth/queries/get-auth";
import { getTickets } from "@/features/ticket/queries/get-tickets";
import { EnhancedTicketForm } from "@/features/ticket/components/enhanced-ticket-form";
import { CreateTicketAuthPrompt } from "@/features/ticket/components/create-ticket-auth-prompt";
import { TicketFiltersWithUrl } from "@/features/ticket/components/ticket-filters";
import { InfiniteTicketList } from "@/features/ticket/components/infinite-ticket-list";
import { Card } from "@/components/ui/card";
import { TicketsClientWrapper } from "./client-wrapper";
import { ExportTicketsButton } from "@/features/ticket/components/export-tickets-button";

type SearchParams = {
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
  searchParams: Promise<SearchParams>;
}

export default async function InfiniteTicketsPage({
  searchParams,
}: TicketsPageProps) {
  const params = await searchParams;

  // Configuração para scroll infinito
  const pageSize = 10; // Carregar 10 tickets por vez

  // Buscar tickets iniciais
  const result = await getTickets({
    page: 0,
    size: pageSize,
    search: params.search,
    status: params.status,
    categoryId: params.categoryId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    filial: params.filial,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });

  // Buscar categorias para o formulário e filtros
  const categories = await getCategories();

  // Verificar autenticação
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

        {/* New Ticket Form Section */}
        <section id="new" className="scroll-mt-16">
          {user ? (
            <EnhancedTicketForm categories={categories} />
          ) : (
            <CreateTicketAuthPrompt />
          )}
        </section>

        {/* Tickets List Section with Infinite Scroll */}
        <section className="flex flex-col gap-y-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold">Seus Tickets</h2>

            {/* Filters Component */}
            <Card className="w-full md:w-auto p-4 shadow-sm border-muted/20">
              <TicketFiltersWithUrl categories={categories} />
            </Card>
          </div>

          <ExportTicketsButton />

          <Suspense fallback={<Spinner />}>
            <InfiniteTicketList
              initialTickets={result.list}
              initialHasMore={result.metadata.hasNextPage}
              filters={{
                search: params.search,
                status: params.status,
                categoryId: params.categoryId,
                dateFrom: params.dateFrom,
                dateTo: params.dateTo,
                filial: params.filial,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
              }}
              pageSize={pageSize}
            />
          </Suspense>
        </section>
      </div>
    </TicketsClientWrapper>
  );
}
