"use client";

import { useState, useCallback, useTransition } from "react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { EnhancedTicketList } from "./enhanced-ticket-list";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { LucideRefreshCw } from "lucide-react";

// Usar o tipo any temporariamente para compatibilidade
type Ticket = any;

interface InfiniteTicketListProps {
  initialTickets: Ticket[];
  initialHasMore: boolean;
  filters: {
    search?: string;
    status?: string;
    categoryId?: string;
    dateFrom?: string;
    dateTo?: string;
    filial?: string;
    sortBy?: string;
    sortOrder?: string;
  };
  pageSize: number;
}

export function InfiniteTicketList({
  initialTickets,
  initialHasMore,
  filters,
  pageSize,
}: InfiniteTicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v != null && v !== "")
        ),
      });

      const response = await fetch(`/api/tickets?${params.toString()}`);
      const data = await response.json();

      startTransition(() => {
        setTickets((prev) => [...prev, ...data.tickets]);
        setHasMore(data.hasMore);
        setPage((prev) => prev + 1);
      });
    } catch (error) {
      console.error("Error loading more tickets:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, pageSize, filters, hasMore, isLoadingMore]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoadingMore || isPending,
    threshold: 300,
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Nenhum ticket encontrado</p>
        <Button variant="outline" onClick={handleRefresh}>
          <LucideRefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EnhancedTicketList tickets={tickets} />

      {/* Loading indicator */}
      {(isLoadingMore || isPending) && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && !isLoadingMore && (
        <div
          ref={loadMoreRef}
          className="h-20 flex items-center justify-center"
        >
          <p className="text-sm text-muted-foreground">
            Role para carregar mais...
          </p>
        </div>
      )}

      {/* End of list message */}
      {!hasMore && tickets.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Você chegou ao final da lista
          </p>
        </div>
      )}
    </div>
  );
}
