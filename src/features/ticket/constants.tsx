import {
  LucideCheckCircle,
  LucideFileText,
  LucidePencil,
  LucideFlag,
} from "lucide-react";

// Define VALID_TICKET_STATUSES as an array of strings for easier validation
export const VALID_TICKET_STATUSES = ["ABERTO", "EM_ANDAMENTO", "CONCLUÍDO"];

export const TICKET_ICONS = {
  ABERTO: <LucideFileText className="h-5 w-5" />,
  CONCLUÍDO: <LucideCheckCircle className="h-5 w-5" />,
  EM_ANDAMENTO: <LucidePencil className="h-5 w-5" />,
};

export const TICKET_STATUS_LABELS = {
  ABERTO: "ABERTO",
  CONCLUÍDO: "CONCLUÍDO",
  EM_ANDAMENTO: "EM_ANDAMENTO",
};

export const TICKET_STATUS_COLORS = {
  ABERTO: "bg-blue-500",
  EM_ANDAMENTO: "bg-amber-500",
  CONCLUÍDO: "bg-green-500",
};

// Map for normalizing various status format inputs to standard enum values
export const STATUS_MAPPING: Record<string, string> = {
  ABERTO: "ABERTO",
  INPROGRESS: "EM_ANDAMENTO",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  "IN-PROGRESS": "EM_ANDAMENTO",
  CONCLUÍDO: "CONCLUÍDO",
  COMPLETED: "CONCLUÍDO",
  CLOSED: "CONCLUÍDO",
  // Add lowercase variations
  open: "ABERTO",
  in_progress: "EM_ANDAMENTO",
  inprogress: "EM_ANDAMENTO",
  "in-progress": "EM_ANDAMENTO",
  done: "CONCLUÍDO",
  completed: "CONCLUÍDO",
  closed: "CONCLUÍDO",
};

// Normalization function to help with status values
export function normalizeTicketStatus(
  status: string | null | undefined
): string | undefined {
  if (!status) return undefined;

  const upperStatus = status.trim().toUpperCase();
  return STATUS_MAPPING[upperStatus] || STATUS_MAPPING[status] || undefined;
}

// New priority constants
export const TICKET_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export type TicketPriority = keyof typeof TICKET_PRIORITY;

export const TICKET_PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TICKET_PRIORITY_COLORS = {
  LOW: "bg-gray-500 dark:bg-gray-600",
  MEDIUM: "bg-blue-500 dark:bg-blue-600",
  HIGH: "bg-orange-500 dark:bg-orange-600",
  URGENT: "bg-red-500 dark:bg-red-600",
};

export const TICKET_PRIORITY_BADGE_STYLES = {
  LOW: "bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  MEDIUM:
    "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700",
  HIGH: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700",
  URGENT:
    "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700",
};
