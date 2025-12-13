// src/features/ticket/components/enhanced-export-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LucideDownload } from "lucide-react";
import { ExportStatsDialog } from "./export-stats-dialog";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toast } from "sonner";

type EnhancedExportButtonProps = {
  showStats?: boolean; // Se true, mostra estatísticas antes de exportar
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function EnhancedExportButton({
  showStats = true,
  variant = "outline",
  size = "default",
  className,
}: EnhancedExportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  // Verificar se o usuário é admin
  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const handleClick = () => {
    if (showStats) {
      setIsDialogOpen(true);
    } else {
      // Exportar diretamente sem mostrar estatísticas
      handleDirectExport();
    }
  };

  const handleDirectExport = async () => {
    try {
      const response = await fetch("/api/export-tickets");

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Você não tem permissão para exportar tickets");
        }
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
    } catch (error) {
      console.error("Erro ao exportar tickets:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao exportar tickets"
      );
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`gap-2 ${className}`}
      >
        <LucideDownload className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar para Excel</span>
        <span className="sm:hidden">Excel</span>
      </Button>

      {showStats && (
        <ExportStatsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}
    </>
  );
}
