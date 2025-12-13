// src/hooks/use-cached-data.ts
import useSWR, { SWRConfiguration } from "swr";
import { toast } from "sonner";

interface CachedDataOptions extends SWRConfiguration {
  onError?: (error: Error) => void;
  showErrorToast?: boolean;
}

/**
 * Hook genérico para buscar dados com cache automático via SWR
 * Integrado com o cache Redis no backend
 */
export function useCachedData<T = any>(
  key: string | null,
  fetcher: (key: string) => Promise<T>,
  options: CachedDataOptions = {}
) {
  const { onError, showErrorToast = true, ...swrOptions } = options;

  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    key,
    fetcher,
    {
      // Revalidar a cada 5 minutos por padrão
      refreshInterval: 5 * 60 * 1000,
      // Manter dados em cache mesmo com erro
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      // Revalidar ao focar na janela
      revalidateOnFocus: false,
      // Manter dados antigos enquanto revalida
      keepPreviousData: true,
      ...swrOptions,
      onError: (err) => {
        console.error(`Error fetching ${key}:`, err);

        if (showErrorToast) {
          toast.error("Erro ao carregar dados");
        }

        onError?.(err);
      },
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    refresh: () => mutate(),
    // Funções úteis adicionais
    isEmpty: !isLoading && !data,
    hasData: !isLoading && !!data,
  };
}

/**
 * Hook específico para dashboard stats com intervalo de atualização rápido
 */
export function useDashboardStatsOptimized() {
  return useCachedData(
    "/api/dashboard-stats",
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    {
      refreshInterval: 30 * 1000, // Atualizar a cada 30 segundos
      dedupingInterval: 10 * 1000, // Evitar requisições duplicadas em 10s
    }
  );
}

/**
 * Hook para tickets com paginação e filtros
 */
export function useTicketsOptimized(
  page: number = 0,
  filters: Record<string, any> = {}
) {
  const params = new URLSearchParams({
    page: page.toString(),
    ...filters,
  });

  return useCachedData(
    `/api/tickets?${params}`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json();
    },
    {
      refreshInterval: 60 * 1000, // Atualizar a cada minuto
      keepPreviousData: true, // Importante para transições suaves
    }
  );
}
