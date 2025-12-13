// src/hooks/use-optimized-tickets.ts
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// Types
export interface TicketFilters {
  search?: string;
  status?: string;
  categoryId?: string;
  filial?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
}

interface TicketsState {
  tickets: any[];
  totalCount: number;
  hasNextPage: boolean;
  isLoading: boolean;
  error: string | null;
  filters: TicketFilters;
  pagination: PaginationState;
}

type TicketsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "SET_TICKETS";
      payload: { tickets: any[]; totalCount: number; hasNextPage: boolean };
    }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_FILTERS"; payload: TicketFilters }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "RESET_PAGINATION" };

// Reducer
function ticketsReducer(
  state: TicketsState,
  action: TicketsAction
): TicketsState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_TICKETS":
      return {
        ...state,
        tickets: action.payload.tickets,
        totalCount: action.payload.totalCount,
        hasNextPage: action.payload.hasNextPage,
        isLoading: false,
        error: null,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "SET_FILTERS":
      return {
        ...state,
        filters: action.payload,
        pagination: { ...state.pagination, page: 0 }, // Reset page on filter change
      };

    case "SET_PAGE":
      return {
        ...state,
        pagination: { ...state.pagination, page: action.payload },
      };

    case "SET_PAGE_SIZE":
      return {
        ...state,
        pagination: { ...state.pagination, pageSize: action.payload, page: 0 },
      };

    case "RESET_PAGINATION":
      return {
        ...state,
        pagination: { page: 0, pageSize: 10 },
      };

    default:
      return state;
  }
}

// Hook
export function useOptimizedTickets() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const initialState: TicketsState = {
    tickets: [],
    totalCount: 0,
    hasNextPage: false,
    isLoading: true,
    error: null,
    filters: {
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      filial: searchParams.get("filial") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    },
    pagination: {
      page: parseInt(searchParams.get("page") || "0"),
      pageSize: parseInt(searchParams.get("pageSize") || "10"),
    },
  };

  const [state, dispatch] = useReducer(ticketsReducer, initialState);

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        dispatch({
          type: "SET_FILTERS",
          payload: { ...state.filters, search: value },
        });
      }, 300);
    };
  }, [state.filters]);

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const params = new URLSearchParams({
        page: state.pagination.page.toString(),
        pageSize: state.pagination.pageSize.toString(),
        ...(state.filters.search && { search: state.filters.search }),
        ...(state.filters.status && { status: state.filters.status }),
        ...(state.filters.categoryId && {
          categoryId: state.filters.categoryId,
        }),
        ...(state.filters.filial && { filial: state.filters.filial }),
        ...(state.filters.dateFrom && { dateFrom: state.filters.dateFrom }),
        ...(state.filters.dateTo && { dateTo: state.filters.dateTo }),
      });

      const response = await fetch(`/api/tickets?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();

      dispatch({
        type: "SET_TICKETS",
        payload: {
          tickets: data.tickets,
          totalCount: data.pagination.totalCount,
          hasNextPage: data.pagination.hasNextPage,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load tickets";
      dispatch({ type: "SET_ERROR", payload: message });
      toast.error(message);
    }
  }, [state.filters, state.pagination]);

  // Update URL when filters/pagination change
  useEffect(() => {
    const params = new URLSearchParams();

    if (state.pagination.page > 0)
      params.set("page", state.pagination.page.toString());
    if (state.pagination.pageSize !== 10)
      params.set("pageSize", state.pagination.pageSize.toString());
    if (state.filters.search) params.set("search", state.filters.search);
    if (state.filters.status) params.set("status", state.filters.status);
    if (state.filters.categoryId)
      params.set("categoryId", state.filters.categoryId);
    if (state.filters.filial) params.set("filial", state.filters.filial);
    if (state.filters.dateFrom) params.set("dateFrom", state.filters.dateFrom);
    if (state.filters.dateTo) params.set("dateTo", state.filters.dateTo);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    // Update URL without causing navigation
    window.history.replaceState({}, "", newUrl);
  }, [state.filters, state.pagination]);

  // Fetch tickets on mount and when dependencies change
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Action handlers
  const setFilters = useCallback((filters: TicketFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setPage = useCallback((page: number) => {
    dispatch({ type: "SET_PAGE", payload: page });
  }, []);

  const setPageSize = useCallback((size: number) => {
    dispatch({ type: "SET_PAGE_SIZE", payload: size });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: "SET_FILTERS", payload: {} });
    dispatch({ type: "RESET_PAGINATION" });
  }, []);

  const handleTicketClick = useCallback(
    (ticketId: string) => {
      router.push(`/tickets/${ticketId}`);
    },
    [router]
  );

  // Optimistic updates
  const updateTicketStatus = useCallback(
    async (ticketId: string, newStatus: string) => {
      // Optimistically update the UI
      const updatedTickets = state.tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      );

      dispatch({
        type: "SET_TICKETS",
        payload: {
          tickets: updatedTickets,
          totalCount: state.totalCount,
          hasNextPage: state.hasNextPage,
        },
      });

      try {
        const response = await fetch(`/api/tickets/${ticketId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          throw new Error("Failed to update status");
        }

        toast.success("Status atualizado com sucesso");
      } catch (error) {
        // Revert on error
        await fetchTickets();
        toast.error("Falha ao atualizar status");
      }
    },
    [state.tickets, state.totalCount, state.hasNextPage, fetchTickets]
  );

  return {
    // State
    tickets: state.tickets,
    totalCount: state.totalCount,
    hasNextPage: state.hasNextPage,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,

    // Actions
    setFilters,
    setPage,
    setPageSize,
    clearFilters,
    refetch: fetchTickets,
    debouncedSearch,
    handleTicketClick,
    updateTicketStatus,
  };
}

// Hook para prefetch de dados do ticket
export function usePrefetchTicket() {
  const prefetchTicket = useCallback(async (ticketId: string) => {
    try {
      // Prefetch ticket details
      await fetch(`/api/tickets/${ticketId}`, {
        method: "GET",
        headers: {
          Purpose: "prefetch",
        },
      });
    } catch (error) {
      // Silently fail prefetch
      console.error("Prefetch failed:", error);
    }
  }, []);

  return prefetchTicket;
}
