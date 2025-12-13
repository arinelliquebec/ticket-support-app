"use client";

import useSWR from "swr";

// Definir os tipos para os dados de resposta da API
export type DashboardStats = {
  stats: {
    tickets: {
      total: number;
      open: number;
      inProgress: number;
      completed: number;
      trend: {
        value: string;
        up: boolean;
      };
    };
    users: {
      total: number;
      trend: {
        value: string;
        up: boolean;
      };
    };
    distribution: {
      open: number;
      inProgress: number;
      completed: number;
    };
  };
  timestamp: string;
};

// Função para buscar os dados da API
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useDashboardStats(refreshInterval = 10000) {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<DashboardStats>("/api/dashboard-stats", fetcher, {
      refreshInterval: refreshInterval, // Atualiza a cada 10 segundos por padrão
      revalidateOnFocus: true, // Revalidar quando o usuário focar na página
      revalidateOnReconnect: true, // Revalidar quando o usuário reconectar
    });

  return {
    data,
    isLoading,
    isError: error,
    isValidating,
    refreshData: mutate,
  };
}
