"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, TrendingUp, CheckCircle2, AlertCircle, 
  BarChart3, PieChart, Calendar, Target, RefreshCw, FileDown 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { generateMetricsPDF } from "@/lib/pdf/generate-metrics-pdf";
import { toast } from "sonner";

type TimeRange = "7d" | "30d" | "90d" | "all";

interface Metrics {
  averageResponseTime: number | null;
  averageResolutionTime: number | null;
  slaCompliance: {
    total: number;
    onTime: number;
    percentage: number;
  };
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  byPriority: Array<{ priority: string; count: number; percentage: number }>;
  byCategory: Array<{ category: string; count: number; percentage: number }>;
  byFilial: Array<{ filial: string; count: number; percentage: number }>;
  ticketsPerDay: Array<{ date: string; count: number }>;
  topCategories: Array<{ name: string; count: number; avgResolutionTime: number }>;
  responseTimeByPriority: Array<{ priority: string; avgTime: number }>;
  adminMetrics: Array<{
    adminId: string;
    adminName: string;
    adminEmail: string;
    ticketsResponded: number;
    avgResponseTime: number | null;
    ticketsResolved: number;
    avgResolutionTime: number | null;
    slaCompliance: number;
  }>;
}

export function AdvancedMetricsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchMetrics = async (range: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/advanced-metrics?range=${range}`);
      
      if (response.status === 403) {
        setError("Acesso negado: Você não tem permissão para visualizar este relatório.");
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao carregar métricas");
      }

      const data = await response.json();
      setMetrics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(timeRange);
  }, [timeRange]);

  const handleExportPDF = async () => {
    if (!metrics) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    setIsExporting(true);
    try {
      // Generate PDF
      generateMetricsPDF(metrics, timeRange);
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const formatHours = (hours: number | null) => {
    if (hours === null) return "N/A";
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)} dias`;
  };

  const priorityColors: Record<string, string> = {
    BAIXA: "bg-blue-500",
  };

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Erro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatório Avançado</h2>
          <p className="text-muted-foreground">Métricas detalhadas do sistema de tickets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={handleExportPDF}
            disabled={isExporting || loading}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Exportar PDF
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchMetrics(timeRange)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="7d">7 dias</TabsTrigger>
              <TabsTrigger value="30d">30 dias</TabsTrigger>
              <TabsTrigger value="90d">90 dias</TabsTrigger>
              <TabsTrigger value="all">Tudo</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTickets}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.openTickets} abertos · {metrics.inProgressTickets} em andamento
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHours(metrics.averageResponseTime)}
            </div>
            <p className="text-xs text-muted-foreground">Média até 1º comentário admin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resolução</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHours(metrics.averageResolutionTime)}
            </div>
            <p className="text-xs text-muted-foreground">Média até conclusão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((metrics.completedTickets / metrics.totalTickets) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedTickets} de {metrics.totalTickets} tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SLA Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Cumprimento de SLA por Prioridade
          </CardTitle>
          <CardDescription>
            Porcentagem de tickets resolvidos dentro do prazo esperado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Geral</Badge>
                <span className="text-sm text-muted-foreground">Meta: 120h</span>
              </div>
              <div className="text-sm font-medium">
                {metrics.slaCompliance.onTime}/{metrics.slaCompliance.total} ({metrics.slaCompliance.percentage}%)
              </div>
            </div>
            <Progress value={metrics.slaCompliance.percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Distributions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* By Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Prioridade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.byPriority.map((item) => (
              <div key={item.priority} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${priorityColors[item.priority]}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.priority}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* By Category */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.byCategory.slice(0, 5).map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-sm">{item.category}</span>
                <Badge variant="secondary">
                  {item.count} ({item.percentage}%)
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Response Time by Priority */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tempo de Resposta por Prioridade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.responseTimeByPriority.map((item) => (
            <div key={item.priority} className="flex items-center justify-between">
              <Badge variant="outline">{item.priority}</Badge>
              <span className="text-sm font-mono">{formatHours(item.avgTime)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Categories with Resolution Time */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias com Tempo Médio de Resolução</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topCategories.map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{cat.count} tickets</Badge>
                    <span className="text-sm text-muted-foreground font-mono">
                      {formatHours(cat.avgResolutionTime)}
                    </span>
                  </div>
                </div>
                <Progress
                  value={Math.min(100, (cat.avgResolutionTime / 48) * 100)}
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tickets per Day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tickets por Dia (Últimos 30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-1">
            {metrics.ticketsPerDay.map((day, i) => {
              const maxCount = Math.max(...metrics.ticketsPerDay.map((d) => d.count));
              const height = (day.count / maxCount) * 100;
              
              return (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t relative group"
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${day.count} tickets`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
                    {day.date.split("-").slice(1).join("/")}
                    <br />
                    {day.count} tickets
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Passe o mouse sobre as barras para ver detalhes
          </div>
        </CardContent>
      </Card>

      {/* By Filial */}
      {metrics.byFilial.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Filial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.byFilial.map((item) => (
              <div key={item.filial} className="flex items-center justify-between">
                <span className="text-sm">{item.filial}</span>
                <Badge variant="secondary">
                  {item.count} ({item.percentage}%)
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Admin Performance Metrics */}
      {metrics.adminMetrics.length > 0 && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingUp className="h-5 w-5" />
              Performance Individual por Administrador
            </CardTitle>
            <CardDescription>
              Métricas de desempenho e produtividade de cada admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Administrador</th>
                    <th className="text-left p-2 font-semibold">Email</th>
                    <th className="text-center p-2 font-semibold">Respostas</th>
                    <th className="text-center p-2 font-semibold">Tempo Resp.</th>
                    <th className="text-center p-2 font-semibold">Resolvidos</th>
                    <th className="text-center p-2 font-semibold">Tempo Resol.</th>
                    <th className="text-center p-2 font-semibold">SLA %</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.adminMetrics.map((admin, index) => {
                    const slaColor =
                      admin.slaCompliance >= 90
                        ? "bg-green-100 text-green-800"
                        : admin.slaCompliance >= 75
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800";

                    return (
                      <tr
                        key={admin.adminId}
                        className={`border-b hover:bg-accent/50 ${
                          index === 0 ? "bg-primary/5" : ""
                        }`}
                      >
                        <td className="p-2 font-medium">
                          {admin.adminName}
                          {index === 0 && (
                            <Badge variant="default" className="ml-2 text-xs">
                              Top
                            </Badge>
                          )}
                        </td>
                        <td className="p-2 text-muted-foreground text-xs">
                          {admin.adminEmail}
                        </td>
                        <td className="p-2 text-center font-mono">
                          {admin.ticketsResponded}
                        </td>
                        <td className="p-2 text-center font-mono">
                          {formatHours(admin.avgResponseTime)}
                        </td>
                        <td className="p-2 text-center font-mono font-semibold">
                          {admin.ticketsResolved}
                        </td>
                        <td className="p-2 text-center font-mono">
                          {formatHours(admin.avgResolutionTime)}
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant="outline" className={slaColor}>
                            {admin.slaCompliance}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>SLA ≥ 90% (Excelente)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>SLA 75-89% (Bom)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>SLA &lt; 75% (Atenção)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

