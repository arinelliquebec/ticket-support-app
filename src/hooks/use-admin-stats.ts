"use client";

import useSWR from "swr";

// Definir os tipos para os dados de resposta da API

export type AdminStatsResponse = {
  users: {
    total: number;
    admins: number;
    regular: number;
    adminPercentage: number;
    regularPercentage: number;
    recent: Array<{
      id: string;
      username: string;
      email: string;
      role: string;
      _count: {
        tickets: number;
      };
    }>;
  };
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    percentages: {
      open: number;
      inProgress: number;
      completed: number;
    };
    byFilial: Array<{ filial: string; count: number; percentage: string }>;
    recent: Array<{
      id: string;
      title: string;
      status: string;
      deadline: string;
      createdAt: string;
      user: {
        username: string;
      } | null;
    }>;
  };
  timestamp: string;
};

// Função para buscar os dados da API
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch admin stats");
    }
    return res.json();
  });

export function useAdminStats(refreshInterval = 10000) {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<AdminStatsResponse>("/api/admin-stats", fetcher, {
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
