import { z } from "zod";

// Enum de prioridades do ticket
export const TicketPriorityEnum = z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]);
export type TicketPriority = z.infer<typeof TicketPriorityEnum>;

// Array de todas as prioridades para iteração
export const TICKET_PRIORITIES: TicketPriority[] = ["BAIXA", "MEDIA", "ALTA", "URGENTE"];

// Mapeamento de prioridades para labels, cores e ícones
export const PRIORITY_CONFIG = {
  BAIXA: {
    label: "Baixa",
    color: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600",
    badgeColor: "bg-slate-500",
    icon: "▽",
    order: 1,
    progress: 25,
    description: "Pode ser resolvido quando houver disponibilidade",
  },
  MEDIA: {
    label: "Média",
    color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-600",
    badgeColor: "bg-blue-500",
    icon: "◇",
    order: 2,
    progress: 50,
    description: "Prioridade normal de atendimento",
  },
  ALTA: {
    label: "Alta",
    color: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-600",
    badgeColor: "bg-amber-500",
    icon: "△",
    order: 3,
    progress: 75,
    description: "Requer atenção prioritária",
  },
  URGENTE: {
    label: "Urgente",
    color: "bg-red-100 text-red-700 border-red-400 dark:bg-red-900/60 dark:text-red-300 dark:border-red-500",
    badgeColor: "bg-red-500",
    glowColor: "rgba(239, 68, 68, 0.5)",
    icon: "⚠",
    order: 4,
    progress: 100,
    description: "Crítico - Requer atenção imediata",
    isUrgent: true,
  },
} as const;

// Esquema base para validação de tickets com campos obrigatórios
export const ticketSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(191, "Título deve ter no máximo 191 caracteres"),
  content: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(1024, "Descrição deve ter no máximo 1024 caracteres"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  filial: z.string().min(1, "Filial é obrigatória"),
  priority: TicketPriorityEnum.default("BAIXA"),
});

// Tipo derivado do esquema
export type TicketFormData = z.infer<typeof ticketSchema>;

// Função utilitária para extrair dados do FormData
export const extractTicketFormData = (
  formData: FormData
): Record<string, unknown> => {
  return {
    title: formData.get("title"),
    content: formData.get("content"),
    categoryId: formData.get("categoryId"),
    filial: formData.get("filial"),
    priority: formData.get("priority") || "BAIXA",
  };
};

// Função para verificar se uma prioridade é urgente
export const isUrgentPriority = (priority: TicketPriority): boolean => {
  return priority === "URGENTE";
};

// Função para obter a configuração de uma prioridade
export const getPriorityConfig = (priority: TicketPriority) => {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.BAIXA;
};
