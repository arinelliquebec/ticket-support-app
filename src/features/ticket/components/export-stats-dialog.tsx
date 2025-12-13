// src/features/ticket/components/export-stats-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LucideDownload,
  LucideFileText,
  LucideCheckCircle,
  LucideClock,
  LucideLoader2,
  LucideAlertCircle,
  LucideBuilding,
  LucideTag,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type ExportStats = {
  totalTickets: number;
  byStatus: {
    open: number;
    inProgress: number;
    completed: number;
  };
  byCategory: Record<string, number>;
  byFilial: Record<string, number>;
};

type ExportStatsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExportStatsDialog({
  open,
  onOpenChange,
}: ExportStatsDialogProps) {
  const [stats, setStats] = useState<ExportStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStats();
    }
  }, [open]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboard-stats");

      if (!response.ok) {
        throw new Error("Falha ao buscar estatísticas");
      }

      const data = await response.json();

      // Transformar os dados para o formato necessário
      setStats({
        totalTickets: data.stats.tickets.total,
        byStatus: {
          open: data.stats.tickets.open,
          inProgress: data.stats.tickets.inProgress,
          completed: data.stats.tickets.completed,
        },
        byCategory: {}, // Seria necessário buscar de outra API ou incluir na dashboard-stats
        byFilial: {}, // Seria necessário buscar de outra API ou incluir na dashboard-stats
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      toast.error("Erro ao carregar estatísticas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const response = await fetch("/api/export-tickets");

      if (!response.ok) {
        throw new Error("Falha ao exportar tickets");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      const fileNameMatch = contentDisposition?.match(/filename="(.+)"/);
      const fileName = fileNameMatch ? fileNameMatch[1] : "tickets_export.xlsx";

      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Tickets exportados com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao exportar tickets:", error);
      toast.error("Erro ao exportar tickets");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusPercentage = (
    status: "CONCLUÍDO" | "EM_ANDAMENTO" | "ABERTO"
  ) => {
    if (!stats || stats.totalTickets === 0) return 0;
    const statusMap = {
      CONCLUÍDO: "completed",
      EM_ANDAMENTO: "inProgress",
      ABERTO: "open",
    } as const;
    return Math.round(
      (stats.byStatus[statusMap[status]] / stats.totalTickets) * 100
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LucideDownload className="h-5 w-5" />
            Exportar Tickets para Excel
          </DialogTitle>
          <DialogDescription>
            Revise as estatísticas antes de exportar os tickets
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LucideLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* Total de Tickets */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTickets}</div>
                <p className="text-xs text-muted-foreground">
                  Tickets serão exportados
                </p>
              </CardContent>
            </Card>

            {/* Estatísticas por Status */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-1">
                    <LucideFileText className="h-4 w-4 text-blue-500" />
                    Abertos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{stats.byStatus.open}</div>
                  <Progress
                    value={getStatusPercentage("ABERTO")}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {getStatusPercentage("ABERTO")}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-1">
                    <LucideClock className="h-4 w-4 text-amber-500" />
                    Em Andamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {stats.byStatus.inProgress}
                  </div>
                  <Progress
                    value={getStatusPercentage("EM_ANDAMENTO")}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {getStatusPercentage("EM_ANDAMENTO")}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-1">
                    <LucideCheckCircle className="h-4 w-4 text-green-500" />
                    Concluídos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {stats.byStatus.completed}
                  </div>
                  <Progress
                    value={getStatusPercentage("CONCLUÍDO")}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {getStatusPercentage("CONCLUÍDO")}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Informações sobre a exportação */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LucideAlertCircle className="h-4 w-4 text-amber-500" />
                  Informações da Exportação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>
                    • O arquivo Excel conterá todos os tickets visíveis para
                    você
                  </li>
                  <li>
                    • Incluirá informações detalhadas como título, descrição,
                    status, categoria e filial
                  </li>
                  <li>• Uma aba de resumo com estatísticas será incluída</li>
                  <li>
                    • O arquivo será baixado automaticamente após a geração
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Erro ao carregar estatísticas
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || isLoading}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <LucideLoader2 className="h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <LucideDownload className="h-4 w-4" />
                Exportar para Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
