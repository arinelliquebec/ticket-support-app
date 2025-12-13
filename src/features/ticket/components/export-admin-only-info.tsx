// src/features/ticket/components/export-admin-only-info.tsx
"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { LucideShieldAlert, LucideDownload } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

type ExportAdminOnlyInfoProps = {
  showAsButton?: boolean;
};

export function ExportAdminOnlyInfo({
  showAsButton = false,
}: ExportAdminOnlyInfoProps) {
  const { user } = useAuth();

  // Se for admin, não mostrar nada (eles devem usar o AdminExportButton)
  if (!user || user.role === "ADMIN") {
    return null;
  }

  if (showAsButton) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="gap-2 opacity-50 cursor-not-allowed"
              disabled
            >
              <LucideDownload className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar para Excel</span>
              <span className="sm:hidden">Excel</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="flex items-center gap-2">
              <LucideShieldAlert className="h-4 w-4 text-amber-500" />
              Apenas administradores podem exportar tickets
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="text-sm text-muted-foreground flex items-center gap-2">
      <LucideShieldAlert className="h-4 w-4" />
      <span>Exportação disponível apenas para administradores</span>
    </div>
  );
}
