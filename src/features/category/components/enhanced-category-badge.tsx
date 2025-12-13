"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LucideHeadphones,
  LucideMonitor,
  LucideMail,
  LucideDollarSign,
  LucideUser,
  LucideGlobe,
  LucideMousePointer,
  LucideHardDrive,
  LucidePhone,
  LucideFile,
  LucideSettings,
  LucideNetwork,
  LucideClipboard,
  LucideDatabase,
  LucideCheckSquare,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedCategoryBadgeProps {
  name: string;
  color: string;
  className?: string;
  showIcon?: boolean;
}

// Map of category names to icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "3CX | Telefonia": <LucidePhone className="h-3 w-3 mr-1" />,
  Fone: <LucideHeadphones className="h-3 w-3 mr-1" />,
  Monitor: <LucideMonitor className="h-3 w-3 mr-1" />,
  Hardware: <LucideHardDrive className="h-3 w-3 mr-1" />,
  AlterData: <LucideDatabase className="h-3 w-3 mr-1" />,
  Internet: <LucideNetwork className="h-3 w-3 mr-1" />,
  Mouse: <LucideMousePointer className="h-3 w-3 mr-1" />,
  Email: <LucideMail className="h-3 w-3 mr-1" />,
  "Domínio Web": <LucideGlobe className="h-3 w-3 mr-1" />,
  "Sistema Financeiro": <LucideDollarSign className="h-3 w-3 mr-1" />,
  D4SIGN: <LucideFile className="h-3 w-3 mr-1" />,
  "Criação | Exclusão de Usuário": <LucideUser className="h-3 w-3 mr-1" />,
  CRM: <LucideClipboard className="h-3 w-3 mr-1" />,
  "Rock Data": <LucideDatabase className="h-3 w-3 mr-1" />,
  "Confirme Online": <LucideCheckSquare className="h-3 w-3 mr-1" />,
  Outros: <LucideSettings className="h-3 w-3 mr-1" />,
};

// Category descriptions for tooltips
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "3CX | Telefonia": "Problemas com sistema telefônico 3CX e telefonia",
  Fone: "Problemas com fones de ouvido ou dispositivos de áudio",
  Monitor: "Problemas relacionados a monitores ou displays",
  Hardware: "Problemas com hardware de computador",
  AlterData: "Problemas com o software AlterData",
  Internet: "Problemas de conexão com a internet",
  Mouse: "Problemas com mouse ou dispositivos apontadores",
  Email: "Configuração de email e problemas relacionados",
  "Domínio Web": "Gerenciamento de domínio web e problemas relacionados",
  "Sistema Financeiro": "Problemas com sistema financeiro",
  D4SIGN: "Problemas com o serviço de assinatura digital D4SIGN",
  "Criação | Exclusão de Usuário":
    "Solicitações de criação e exclusão de usuários",
  CRM: "Problemas com sistema de gerenciamento de relacionamento com o cliente",
  "Rock Data": "Problemas relacionados à plataforma Rock Data",
  "Confirme Online": "Problemas com o serviço Confirme Online",
  Outros: "Outros problemas diversos",
};

export function EnhancedCategoryBadge({
  name,
  color,
  className,
  showIcon = true,
}: EnhancedCategoryBadgeProps) {
  const icon = CATEGORY_ICONS[name] || (
    <LucideSettings className="h-3 w-3 mr-1" />
  );
  const description = CATEGORY_DESCRIPTIONS[name] || name;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            style={{
              backgroundColor: `${color}20`, // Add transparency to the color
              borderColor: color,
              color: color,
            }}
            className={cn(
              "font-medium hover:bg-opacity-30 transition-all duration-300",
              className
            )}
          >
            {showIcon && icon}
            {name}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
