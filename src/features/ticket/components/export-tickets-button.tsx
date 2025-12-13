// src/features/ticket/components/export-tickets-button.tsx
"use client";

import { useState } from "react";
import {
  LucideFileSpreadsheet,
  LucideDownload,
  LucideLoader2,
  LucideCheckCircle,
  LucideAlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportTicketsButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
  includeFilters?: boolean;
  filters?: {
    status?: string;
    categoryId?: string;
    filial?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export function ExportTicketsButton({
  variant = "outline",
  size = "default",
  className = "",
  showLabel = true,
  includeFilters = false,
  filters = {},
}: ExportTicketsButtonProps) {
  const { user, isFetched } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Não renderizar se não for admin
  if (!isFetched || !user || user.role !== "ADMIN") {
    return null;
  }

  const handleExport = async (format: "full" | "filtered" = "full") => {
    try {
      setIsExporting(true);
      setExportStatus("idle");

      // Construir URL com filtros se necessário
      let url = "/api/export-tickets";

      if (format === "filtered" && includeFilters) {
        const params = new URLSearchParams();

        if (filters.status) params.append("status", filters.status);
        if (filters.categoryId) params.append("categoryId", filters.categoryId);
        if (filters.filial) params.append("filial", filters.filial);
        if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.append("dateTo", filters.dateTo);

        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      // Fazer a requisição
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao exportar tickets");
      }

      // Obter o blob do arquivo
      const blob = await response.blob();

      // Criar link de download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Gerar nome do arquivo com timestamp
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, "");
      const fileName = `tickets_export_${timestamp}.xlsx`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL
      window.URL.revokeObjectURL(downloadUrl);

      setExportStatus("success");
      toast.success("Tickets exportados com sucesso!", {
        description: `Arquivo: ${fileName}`,
      });

      // Reset status após 3 segundos
      setTimeout(() => {
        setExportStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Erro ao exportar tickets:", error);
      setExportStatus("error");

      toast.error("Falha ao exportar tickets", {
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });

      // Reset status após 3 segundos
      setTimeout(() => {
        setExportStatus("idle");
      }, 3000);
    } finally {
      setIsExporting(false);
    }
  };

  // Ícone baseado no status
  const getIcon = () => {
    if (isExporting) {
      return <LucideLoader2 className="h-4 w-4 animate-spin" />;
    }

    switch (exportStatus) {
      case "success":
        return <LucideCheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <LucideAlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <LucideFileSpreadsheet className="h-4 w-4" />;
    }
  };

  // Se temos filtros, mostrar dropdown com opções
  if (includeFilters) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            disabled={isExporting}
          >
            {getIcon()}
            {showLabel && <span className="ml-2">Exportar</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Opções de Exportação</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleExport("full")}
            disabled={isExporting}
            className="cursor-pointer"
          >
            <LucideFileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Exportar todos os tickets</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleExport("filtered")}
            disabled={isExporting}
            className="cursor-pointer"
          >
            <LucideDownload className="mr-2 h-4 w-4" />
            <span>Exportar com filtros atuais</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Botão simples sem filtros
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={() => handleExport("full")}
            disabled={isExporting}
            className={className}
          >
            {getIcon()}
            {showLabel && <span className="ml-2">Exportar Excel</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Exportar todos os tickets para Excel</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
