// src/features/ticket/queries/optimized-get-tickets.ts
import { createCachedQuery } from "@/lib/cache/query-cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Define GetTicketsOptions type or import it if defined elsewhere
type GetTicketsOptions = {
  page: number;
  size: number;
  // Add other filter fields as needed, e.g. status?: string, categoryId?: string, etc.
};

// Dummy implementation; replace with your actual logic or import if defined elsewhere
function buildOptimizedWhereClause(
  options: GetTicketsOptions,
  userId: string,
  isAdmin: boolean
): Prisma.TicketWhereInput {
  // Example: filter by userId if not admin
  if (!isAdmin) {
    return { userId };
  }
  return {};
}

export const getOptimizedTickets = createCachedQuery(
  async (options: GetTicketsOptions, userId: string, isAdmin: boolean) => {
    // Usar select específico para reduzir payload
    const select: Prisma.TicketSelect = {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      deadline: true,
      filial: true,
      // Usar select nested para reduzir dados relacionados
      user: {
        select: {
          username: true,
          avatarUrl: true,
        },
      },
      category: {
        select: {
          name: true,
          color: true,
        },
      },
      // Usar _count ao invés de incluir todos os registros
      _count: {
        select: {
          comments: true,
          attachments: true,
        },
      },
    };

    const where = buildOptimizedWhereClause(options, userId, isAdmin);

    // Executar count e findMany em paralelo com connection pooling
    const [tickets, totalCount] = await prisma.$transaction(
      [
        prisma.ticket.findMany({
          where,
          select,
          orderBy: { createdAt: "desc" },
          skip: options.page * options.size,
          take: options.size,
        }),
        prisma.ticket.count({ where }),
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      }
    );

    return { tickets, totalCount };
  },
  (options, userId, isAdmin) =>
    `tickets:${userId}:${isAdmin}:${JSON.stringify(options)}`,
  {
    ttl: 300, // 5 minutos
    tags: ["tickets"],
  }
);
