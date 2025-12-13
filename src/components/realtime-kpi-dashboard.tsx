"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Ticket,
  Activity,
  Zap,
  BarChart3,
  Timer,
  Target,
  LucideIcon,
  RefreshCw,
  WifiOff,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

interface KPIMetric {
  id: string;
  label: string;
  value: number | string;
  change?: number; // Percentage change
  trend?: "up" | "down" | "stable";
  icon: LucideIcon;
  color: string;
  unit?: string;
  target?: number;
  lastUpdate?: Date;
}

interface LiveActivity {
  id: string;
  type:
    | "ticket_created"
    | "ticket_resolved"
    | "comment_added"
    | "status_changed"
    | "priority_changed";
  description: string;
  timestamp: Date;
  user?: string;
  ticketId?: string;
  priority?: string;
}

interface RealtimeKPIDashboardProps {
  userEmail: string;
  userName: string;
}

export function RealtimeKPIDashboard({
  userEmail,
  userName,
}: RealtimeKPIDashboardProps) {
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { isConnected, subscribe } = useRealtimeNotifications();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch initial KPIs
  const fetchKPIs = useCallback(async () => {
    try {
      const response = await fetch("/api/realtime-kpis");
      if (!response.ok) throw new Error("Failed to fetch KPIs");

      const data = await response.json();

      // Transform data into KPI metrics
      const metrics: KPIMetric[] = [
        {
          id: "total_tickets",
          label: "Total de Tickets",
          value: data.totalTickets || 0,
          change: data.ticketsChangePercent || 0,
          trend:
            data.ticketsChangePercent > 0
              ? "up"
              : data.ticketsChangePercent < 0
              ? "down"
              : "stable",
          icon: Ticket,
          color: "bg-blue-500",
          lastUpdate: new Date(),
        },
        {
          id: "open_tickets",
          label: "Tickets Abertos",
          value: data.openTickets || 0,
          icon: AlertTriangle,
          color: "bg-yellow-500",
          target: 10, // Target: keep below 10 open tickets
          lastUpdate: new Date(),
        },
        {
          id: "avg_response_time",
          label: "Tempo Médio de Resposta",
          value: data.avgResponseTime
            ? `${data.avgResponseTime.toFixed(1)}h`
            : "N/A",
          change: data.responseTimeChange || 0,
          trend: data.responseTimeChange < 0 ? "up" : "down", // Lower is better
          icon: Clock,
          color: "bg-purple-500",
          unit: "horas",
          target: 4, // Target: 4 hours
          lastUpdate: new Date(),
        },
        {
          id: "sla_compliance",
          label: "SLA Compliance",
          value: `${data.slaCompliance || 0}%`,
          change: data.slaChange || 0,
          trend:
            data.slaChange > 0 ? "up" : data.slaChange < 0 ? "down" : "stable",
          icon: Target,
          color:
            data.slaCompliance >= 90
              ? "bg-green-500"
              : data.slaCompliance >= 70
              ? "bg-yellow-500"
              : "bg-red-500",
          target: 90, // Target: 90% SLA
          lastUpdate: new Date(),
        },
        {
          id: "active_admins",
          label: "Admins Ativos",
          value: data.activeAdmins || 0,
          icon: Users,
          color: "bg-indigo-500",
          lastUpdate: new Date(),
        },

        {
          id: "tickets_today",
          label: "Tickets Hoje",
          value: data.ticketsToday || 0,
          change: data.ticketsTodayChange || 0,
          trend: data.ticketsTodayChange > 0 ? "up" : "down",
          icon: Activity,
          color: "bg-teal-500",
          lastUpdate: new Date(),
        },
        {
          id: "resolution_rate",
          label: "Taxa de Resolução",
          value: `${data.resolutionRate || 0}%`,
          change: data.resolutionRateChange || 0,
          trend: data.resolutionRateChange > 0 ? "up" : "down",
          icon: CheckCircle2,
          color: data.resolutionRate >= 80 ? "bg-green-500" : "bg-orange-500",
          target: 85, // Target: 85% resolution rate
          lastUpdate: new Date(),
        },
      ];

      setKpis(metrics);
      setLastUpdate(new Date());

      // Add to activities
      if (data.recentActivities) {
        setActivities((prev) =>
          [...data.recentActivities, ...prev].slice(0, 50)
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      setLoading(false);
    }
  }, []);

  // Handle real-time KPI updates
  const handleKPIUpdate = useCallback(
    (event: any) => {
      console.log("[RealtimeKPI] Update received:", event.type);

      // Update specific KPIs based on event type
      switch (event.type) {
        case "kpi:ticket_created":
          setKpis((prev) =>
            prev.map((kpi) => {
              if (kpi.id === "total_tickets") {
                return {
                  ...kpi,
                  value: Number(kpi.value) + 1,
                  lastUpdate: new Date(),
                };
              }
              if (kpi.id === "open_tickets") {
                return {
                  ...kpi,
                  value: Number(kpi.value) + 1,
                  lastUpdate: new Date(),
                };
              }
              if (kpi.id === "tickets_today") {
                return {
                  ...kpi,
                  value: Number(kpi.value) + 1,
                  lastUpdate: new Date(),
                };
              }
              return kpi;
            })
          );

          // Add to activity feed
          setActivities((prev) =>
            [
              {
                id: `activity-${Date.now()}`,
                type: "ticket_created" as const,
                description: `Novo ticket criado: ${event.data.title}`,
                timestamp: new Date(),
                user: event.data.user,
                ticketId: event.data.ticketId,
                priority: event.data.priority,
              },
              ...prev,
            ].slice(0, 50)
          );
          break;

        case "kpi:ticket_resolved":
          setKpis((prev) =>
            prev.map((kpi) => {
              if (kpi.id === "open_tickets") {
                return {
                  ...kpi,
                  value: Math.max(0, Number(kpi.value) - 1),
                  lastUpdate: new Date(),
                };
              }
              return kpi;
            })
          );

          setActivities((prev) =>
            [
              {
                id: `activity-${Date.now()}`,
                type: "ticket_resolved" as const,
                description: `Ticket resolvido: #${event.data.ticketId}`,
                timestamp: new Date(),
                user: event.data.resolvedBy,
              },
              ...prev,
            ].slice(0, 50)
          );
          break;

        case "kpi:full_update":
          // Full KPI refresh from server
          fetchKPIs();
          break;
      }

      setLastUpdate(new Date());
    },
    [fetchKPIs]
  );

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribeKPI = subscribe("kpi:update", handleKPIUpdate);
    const unsubscribeTicketCreated = subscribe(
      "kpi:ticket_created",
      handleKPIUpdate
    );
    const unsubscribeTicketResolved = subscribe(
      "kpi:ticket_resolved",
      handleKPIUpdate
    );
    const unsubscribeFullUpdate = subscribe("kpi:full_update", handleKPIUpdate);

    return () => {
      unsubscribeKPI();
      unsubscribeTicketCreated();
      unsubscribeTicketResolved();
      unsubscribeFullUpdate();
    };
  }, [subscribe, handleKPIUpdate]);

  // Initial fetch
  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchKPIs();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchKPIs]);

  const getTrendIcon = (trend?: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3" />;
      case "down":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getActivityIcon = (type: LiveActivity["type"]) => {
    switch (type) {
      case "ticket_created":
        return <Ticket className="h-4 w-4 text-blue-500" />;
      case "ticket_resolved":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "comment_added":
        return <Activity className="h-4 w-4 text-purple-500" />;
      case "status_changed":
        return <RefreshCw className="h-4 w-4 text-orange-500" />;
      case "priority_changed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Dashboard KPIs em Tempo Real
          </h2>
          <p className="text-muted-foreground mt-1">
            Exclusivo para {userName} • Última atualização:{" "}
            {format(lastUpdate, "HH:mm:ss", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge
            variant={isConnected ? "default" : "outline"}
            className={cn(
              "gap-1",
              !isConnected && "border-red-500 text-red-500"
            )}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                Conectado
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Desconectado
              </>
            )}
          </Badge>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              autoRefresh
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <RefreshCw
              className={cn("h-4 w-4", autoRefresh && "animate-spin-slow")}
            />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
                kpi.lastUpdate &&
                  new Date().getTime() - kpi.lastUpdate.getTime() < 2000 &&
                  "ring-2 ring-primary animate-pulse-once"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div
                    className={cn("p-2 rounded-lg", kpi.color, "bg-opacity-10")}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        kpi.color.replace("bg-", "text-")
                      )}
                    />
                  </div>
                  {kpi.trend && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        kpi.trend === "up"
                          ? "text-green-500"
                          : kpi.trend === "down"
                          ? "text-red-500"
                          : "text-gray-500"
                      )}
                    >
                      {kpi.change !== undefined && (
                        <span>
                          {kpi.change > 0 ? "+" : ""}
                          {kpi.change.toFixed(1)}%
                        </span>
                      )}
                      {getTrendIcon(kpi.trend)}
                    </div>
                  )}
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpi.value}
                  {kpi.unit && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {kpi.unit}
                    </span>
                  )}
                </div>

                {kpi.target !== undefined && typeof kpi.value === "number" && (
                  <div className="mt-2">
                    <Progress
                      value={Math.min(100, (kpi.value / kpi.target) * 100)}
                      className="h-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Meta: {kpi.target}
                      {kpi.unit || ""}
                    </p>
                  </div>
                )}
              </CardContent>

              {/* Live indicator */}
              {kpi.lastUpdate &&
                new Date().getTime() - kpi.lastUpdate.getTime() < 2000 && (
                  <div className="absolute top-2 right-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                )}
            </Card>
          );
        })}
      </div>

      {/* Live Activity Feed */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade em Tempo Real
          </CardTitle>
          <CardDescription>Últimas 50 atividades do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma atividade recente
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0"
                  >
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        {activity.description}
                        {activity.priority && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "ml-2 text-xs"
                            )}
                          >
                            {activity.priority}
                          </Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {activity.user && <span>por {activity.user}</span>}
                        <span>•</span>
                        <span>
                          {format(activity.timestamp, "HH:mm:ss", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
