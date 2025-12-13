// src/components/optimized-dashboard.tsx
"use client";

import { useDashboardStatsOptimized } from "@/hooks/use-cached-data";
import {
  LucideTicket,
  LucideCheckCircle,
  LucideClock,
  LucideFileText,
  LucideUsers,
  LucideRefreshCw,
  LucideAlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export function OptimizedDashboard() {
  const { data, error, isLoading, isValidating, refresh } =
    useDashboardStatsOptimized();

  if (error) {
    return (
      <Alert variant="destructive">
        <LucideAlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar estatísticas. Por favor, tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Header com botão de refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isValidating}
        >
          <LucideRefreshCw
            className={`h-4 w-4 mr-2 ${isValidating ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Tickets */}
        <StatsCard
          title="Total de Tickets"
          value={stats?.tickets.total}
          trend={stats?.tickets.trend}
          icon={<LucideTicket className="h-5 w-5" />}
          loading={isLoading}
        />

        {/* Tickets Abertos */}
        <StatsCard
          title="Abertos"
          value={stats?.tickets.open}
          percentage={stats?.distribution.open}
          icon={<LucideFileText className="h-5 w-5" />}
          loading={isLoading}
          color="blue"
        />

        {/* Em Andamento */}
        <StatsCard
          title="Em Andamento"
          value={stats?.tickets.inProgress}
          percentage={stats?.distribution.inProgress}
          icon={<LucideClock className="h-5 w-5" />}
          loading={isLoading}
          color="amber"
        />

        {/* Concluídos */}
        <StatsCard
          title="Concluídos"
          value={stats?.tickets.completed}
          percentage={stats?.distribution.completed}
          icon={<LucideCheckCircle className="h-5 w-5" />}
          loading={isLoading}
          color="green"
        />
      </div>

      {/* Distribuição visual */}
      {!isLoading && stats && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <DistributionBar
                label="Abertos"
                value={stats.distribution.open}
                color="bg-blue-500"
              />
              <DistributionBar
                label="Em Andamento"
                value={stats.distribution.inProgress}
                color="bg-amber-500"
              />
              <DistributionBar
                label="Concluídos"
                value={stats.distribution.completed}
                color="bg-green-500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indicador de cache */}
      {data && (
        <p className="text-xs text-muted-foreground text-center">
          Última atualização: {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

// Componente de Card de Estatística
interface StatsCardProps {
  title: string;
  value?: number;
  trend?: { value: string; up: boolean };
  percentage?: number;
  icon: React.ReactNode;
  loading: boolean;
  color?: string;
}

function StatsCard({
  title,
  value,
  trend,
  percentage,
  icon,
  loading,
  color = "primary",
}: StatsCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    blue: "text-blue-500 bg-blue-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    green: "text-green-500 bg-green-500/10",
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-12" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div
            className={`p-2 rounded-full ${
              colorClasses[color as keyof typeof colorClasses]
            }`}
          >
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value || 0}</div>
        {trend && (
          <p
            className={`text-xs ${
              trend.up ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.value} em relação ao mês anterior
          </p>
        )}
        {percentage !== undefined && (
          <p className="text-xs text-muted-foreground">
            {percentage}% do total
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Barra de Distribuição
interface DistributionBarProps {
  label: string;
  value: number;
  color: string;
}

function DistributionBar({ label, value, color }: DistributionBarProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
