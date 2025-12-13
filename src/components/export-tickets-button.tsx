// src/components/export-tickets-button.tsx
"use client";

import { useState } from "react";
import {
  LucideDownload,
  LucideLoader2,
  LucideFileSpreadsheet,
  LucideAlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExportTicketsButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
  tooltipText?: string;
}

export function ExportTicketsButton({
  variant = "outline",
  size = "default",
  className = "",
  showLabel = true,
  tooltipText = "Exportar todos os tickets para Excel",
}: ExportTicketsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Mostrar toast de início
      toast.info("Preparando exportação...", {
        duration: 2000,
      });

      // Fazer requisição para a API
      const response = await fetch("/api/export-tickets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Verificar se a resposta foi bem sucedida
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error(
            "Você precisa estar autenticado para exportar tickets"
          );
        } else if (response.status === 403) {
          throw new Error(
            "Apenas administradores podem exportar todos os tickets"
          );
        } else {
          throw new Error(errorData.error || "Falha ao exportar tickets");
        }
      }

      // Obter o blob do arquivo
      const blob = await response.blob();

      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob);

      // Criar elemento de link temporário para download
      const link = document.createElement("a");
      link.href = url;

      // Definir nome do arquivo com data e hora
      const now = new Date();
      const fileName = `tickets_export_${format(now, "yyyy-MM-dd_HH-mm", {
        locale: ptBR,
      })}.xlsx`;
      link.download = fileName;

      // Adicionar ao DOM temporariamente e clicar
      document.body.appendChild(link);
      link.click();

      // Remover o link do DOM
      document.body.removeChild(link);

      // Liberar a URL temporária
      window.URL.revokeObjectURL(url);

      // Mostrar sucesso
      toast.success("Tickets exportados com sucesso!", {
        description: `Arquivo salvo como ${fileName}`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao exportar tickets:", error);

      // Mostrar erro
      toast.error("Falha ao exportar tickets", {
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const buttonContent = (
    <>
      {isExporting ? (
        <LucideLoader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LucideFileSpreadsheet className="h-4 w-4" />
      )}
      {showLabel && (
        <span className={size === "icon" ? "sr-only" : "ml-2"}>
          {isExporting ? "Exportando..." : "Exportar Excel"}
        </span>
      )}
    </>
  );

  const button = (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleExport}
      disabled={isExporting}
    >
      {buttonContent}
    </Button>
  );

  // Se houver tooltip, envolver o botão
  if (tooltipText && !showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

// Componente adicional para mostrar informações sobre a exportação
export function ExportInfo() {
  return (
    <div className="flex items-start gap-2 p-4 bg-muted/30 rounded-lg border border-muted">
      <LucideAlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div className="space-y-1 text-sm">
        <p className="font-medium">Sobre a exportação Excel:</p>
        <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
          <li>Exporta todos os tickets visíveis para você</li>
          <li>
            Inclui informações completas: título, status, categoria, filial,
            etc.
          </li>
          <li>Gera arquivo com duas abas: Dados e Resumo estatístico</li>
          <li>Formato compatível com Excel, Google Sheets e LibreOffice</li>
        </ul>
      </div>
    </div>
  );
}
