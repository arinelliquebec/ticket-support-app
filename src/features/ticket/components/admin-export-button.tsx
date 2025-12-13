// src/features/ticket/components/admin-export-button.tsx
"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { ExportTicketsButton } from "./export-tickets-button";
import { EnhancedExportButton } from "./enhanced-export-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { LucideDownload, LucideLock } from "lucide-react";

type AdminExportButtonProps = {
  variant?: "simple" | "enhanced";
  showStats?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showTooltipForNonAdmin?: boolean;
};

export function AdminExportButton({
  variant = "simple",
  showStats = false,
  size = "default",
  className,
  showTooltipForNonAdmin = true,
}: AdminExportButtonProps) {
  const { user, isFetched } = useAuth();

  // Se ainda não carregou os dados do usuário, não mostra nada
  if (!isFetched || !user) {
    return null;
  }

  // Se é admin, mostra o botão apropriado
  if (user.role === "ADMIN") {
    return variant === "enhanced" ? (
      <EnhancedExportButton
        showStats={showStats}
        size={size}
        className={className}
      />
    ) : (
      <ExportTicketsButton />
    );
  }

  // Se não é admin e deve mostrar tooltip
  if (showTooltipForNonAdmin) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={size}
              disabled
              className={`gap-2 ${className}`}
            >
              <LucideLock className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Apenas administradores podem exportar tickets</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Se não é admin e não deve mostrar tooltip, não mostra nada
  return null;
}
