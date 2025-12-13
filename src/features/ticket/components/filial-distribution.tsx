"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LucideBuilding,
  LucideLoader2,
  LucideAlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminStats } from "@/hooks/use-admin-stats";

type FilialDistributionProps = {
  className?: string;
};

export const FilialDistribution = ({ className }: FilialDistributionProps) => {
  const { data, isLoading, isError } = useAdminStats(30000); // Refresh every 30 seconds
  const [filialData, setFilialData] = useState<
    Array<{ filial: string; count: number; percentage: string }>
  >([]);

  // Extract filial data from admin stats - with improved error handling
  useEffect(() => {
    if (data?.tickets?.byFilial && Array.isArray(data.tickets.byFilial)) {
      setFilialData(data.tickets.byFilial);
    } else {
      // Set empty array as fallback when data is missing or invalid
      setFilialData([]);
    }
  }, [data]);

  // Define colors for different filiais
  const getFilialColor = (filial: string) => {
    const colors = {
      Matriz: "bg-blue-500",
      "Filial São Paulo": "bg-green-500",
      // "Filial Rio de Janeiro": "bg-amber-500",
      "Filial Belo Horizonte": "bg-purple-500",
      "Filial Ribeirão Preto": "bg-red-500",
      "Filial Salvador": "bg-indigo-500",
      "Filial Curitiba": "bg-pink-500",
      "Filial Campinas": "bg-teal-500",
      "Filial Joinville": "bg-cyan-500",
      "Filial Brasília": "bg-sky-500",
      "Filial Recife": "bg-emerald-500",
      "Filial Manaus": "bg-rose-500",
      "Filial Piraúba": "bg-fuchsia-500",
      "Filial Orlando": "bg-violet-500",
      "Filial Nova York": "bg-lime-500",
      "Filial Vitória": "bg-purple-500",
      "Filial Desconhecida": "bg-gray-500",
    };

    return (colors as any)[filial] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <LucideBuilding className="h-5 w-5 text-primary" />
            Distribuição de Filiais
          </CardTitle>
          <CardDescription>Distribuição de tickets por filiais</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center py-8">
            <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <LucideBuilding className="h-5 w-5 text-primary" />
            Distribuição de Filiais
          </CardTitle>
          <CardDescription>Distribuição de tickets por Filiais</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Alert variant="destructive">
            <LucideAlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Falha ao carregar dados de filiais. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <LucideBuilding className="h-5 w-5 text-primary" />
          Filial Distribution
        </CardTitle>
        <CardDescription>
          Distribution of tickets across branches
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {filialData.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No filial data available
          </div>
        ) : (
          <div className="space-y-4">
            {filialData.map((item) => (
              <div key={item.filial} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <span
                      className={`h-3 w-3 rounded-full ${getFilialColor(
                        item.filial
                      )} mr-1.5`}
                    ></span>
                    {item.filial}
                  </span>
                  <span>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <Progress
                  value={parseFloat(item.percentage)}
                  className="h-2 bg-secondary/20"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
