// src/hooks/use-optimized-tickets-query.ts
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Ticket } from "@prisma/client";
import { TicketFilters } from "./use-optimized-tickets";

interface UseOptimizedTicketsOptions {
  page: number;
  pageSize: number;
  filters: TicketFilters;
}

interface OptimizedTicketsResult {
  tickets: Ticket[];
  totalCount: number;
  hasNextPage: boolean;
}

export function useOptimizedTicketsQuery(options: UseOptimizedTicketsOptions) {
  const queryClient = useQueryClient();
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.8,
    rootMargin: "100px",
  });

  // Main query with stale-while-revalidate
  const { data, isLoading, isFetching, isError, error } =
    useQuery<OptimizedTicketsResult>({
      queryKey: ["tickets", options],
      queryFn: () => fetchOptimizedTickets(options),
      staleTime: 30 * 1000, // 30 seconds
      refetchInterval: false,
      refetchOnWindowFocus: false,
    });

  // Prefetch next page
  useEffect(() => {
    if (data?.hasNextPage && !isFetching) {
      const nextPageOptions = { ...options, page: options.page + 1 };
      queryClient.prefetchQuery({
        queryKey: ["tickets", nextPageOptions],
        queryFn: () => fetchOptimizedTickets(nextPageOptions),
        staleTime: 30 * 1000,
      });
    }
  }, [data?.hasNextPage, options, queryClient, isFetching]);

  // Virtual scrolling for large lists
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: data?.tickets.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated ticket item height
    overscan: 5,
  });

  // Optimistic update mutation
  interface UpdateTicketVariables {
    id: Ticket["id"];
    updates: Partial<Ticket>;
  }

  const updateTicketMutation = useMutation({
    mutationFn: updateTicket,
    onMutate: async (variables: UpdateTicketVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tickets"] });

      // Snapshot previous value
      const previousTickets = queryClient.getQueryData(["tickets", options]);

      // Optimistically update
      queryClient.setQueryData(["tickets", options], (old: any) => ({
        ...old,
        tickets: old.tickets.map((ticket: Ticket) =>
          ticket.id === variables.id
            ? { ...ticket, ...variables.updates }
            : ticket
        ),
      }));

      return { previousTickets };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTickets) {
        queryClient.setQueryData(["tickets", options], context.previousTickets);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  return {
    tickets: data?.tickets || [],
    totalCount: data?.totalCount || 0,
    hasNextPage: data?.hasNextPage || false,
    isLoading,
    isFetching,
    isError,
    error,
    updateTicket: updateTicketMutation.mutate,
  };
}

// Implementations should be provided elsewhere or replaced with actual logic
function fetchOptimizedTickets(
  options: UseOptimizedTicketsOptions
): Promise<OptimizedTicketsResult> {
  throw new Error("Function not implemented.");
}

function updateTicket(variables: {
  id: Ticket["id"];
  updates: Partial<Ticket>;
}): Promise<unknown> {
  throw new Error("Function not implemented.");
}
