// src/features/ticket/components/ticket-list.tsx
import { getTickets, GetTicketsOptions } from "../queries/get-tickets";
import { Suspense } from "react";
import { Spinner } from "@/components/spinner";
import { EmptyTickets } from "./empty-tickets";
import { EnhancedTicketList } from "./enhanced-ticket-list";
import { getCategories } from "@/features/category/actions";
import { TicketPaginationWithUrl } from "./ticket-pagination-with-url";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LucideAlertTriangle } from "lucide-react";

type TicketListProps = {
  page?: number;
  pageSize?: number;
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

const TicketList = async ({
  page = 0,
  pageSize = 5,
  search,
  status,
  categoryId,
  dateFrom,
  dateTo,
  filial,
  priority,
  sortBy,
  sortOrder,
}: TicketListProps) => {
  try {
    // Prepare options for getTickets - pass params directly without processing
    const options: GetTicketsOptions = {
      page,
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
    };

    // Fetch tickets and categories in parallel
    const [paginatedTickets, categories] = await Promise.all([
      getTickets(options),
      getCategories(),
    ]);

    const { list: tickets, metadata } = paginatedTickets;

    // Show empty state if no tickets exist at all
    if (
      tickets.length === 0 &&
      metadata.count === 0 &&
      !search &&
      !status &&
      !categoryId &&
      !dateFrom &&
      !dateTo &&
      !filial &&
      !priority
    ) {
      return <EmptyTickets />;
    }

    // Show "no results" message if filters applied but no tickets found
    if (
      tickets.length === 0 &&
      (search ||
        status ||
        categoryId ||
        dateFrom ||
        dateTo ||
        filial ||
        priority)
    ) {
      return (
        <div className="w-full space-y-4">
          <Alert
            variant="default"
            className="border-yellow-500/50 text-yellow-600 dark:text-yellow-500 [&>svg]:text-yellow-500"
          >
            <LucideAlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nenhum Ticket encontrado com os filtros aplicados
            </AlertDescription>
          </Alert>

          <div className="w-full text-center py-8 border-2 border-dashed rounded-lg border-muted/30">
            <h3 className="text-xl font-medium mb-2">
              Nenhum Ticket encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar seus filtros de pesquisa
            </p>
          </div>
        </div>
      );
    }

    // Enhance tickets with category information
    const enhancedTickets = tickets.map((ticket) => {
      const ticketCategory = ticket.categoryId
        ? categories.find((cat) => cat.id === ticket.categoryId)
        : null;

      return {
        ...ticket,
        category: ticketCategory
          ? {
              id: ticketCategory.id,
              name: ticketCategory.name,
              color: ticketCategory.color,
            }
          : null,
      };
    });

    return (
      <div className="flex-1 flex flex-col items-center pb-12 w-full">
        <Suspense fallback={<Spinner />}>
          <EnhancedTicketList tickets={enhancedTickets} />

          {metadata.count > 0 && (
            <div className="w-full mt-8">
              <TicketPaginationWithUrl
                currentPage={page}
                totalCount={metadata.count}
                pageSize={pageSize}
                hasNextPage={metadata.hasNextPage}
              />
            </div>
          )}
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error in TicketList component:", error);
    return (
      <Alert variant="destructive">
        <LucideAlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading tickets. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
};

export { TicketList };
