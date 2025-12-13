// src/features/ticket/queries/optimized-queries.ts
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";

// Types
export type TicketFilters = {
  status?: string;
  categoryId?: string;
  filial?: string;
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type OptimizedTicket = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  deadline: string;
  filial: string | null;
  user: {
    username: string;
  } | null;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  _count: {
    comments: number;
    attachments: number;
  };
};

// Função auxiliar para construir where clause
function buildWhereClause(
  filters: TicketFilters,
  userId?: string,
  isAdmin?: boolean
): Prisma.TicketWhereInput {
  const where: Prisma.TicketWhereInput = {};

  // Se não for admin, filtrar apenas tickets do usuário
  if (!isAdmin && userId) {
    where.userId = userId;
  }

  // Filtros básicos
  if (filters.status) {
    where.status = filters.status as any;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.filial) {
    where.filial = filters.filial;
  }

  if (filters.userId && isAdmin) {
    where.userId = filters.userId;
  }

  // Filtro de busca
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { content: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Filtros de data
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.createdAt.lte = new Date(filters.dateTo);
    }
  }

  return where;
}

// Query otimizada para listar tickets com cache
export const getOptimizedTickets = async (
  filters: TicketFilters,
  page: number = 0,
  pageSize: number = 10,
  userId?: string,
  isAdmin: boolean = false
): Promise<{
  tickets: OptimizedTicket[];
  totalCount: number;
  hasNextPage: boolean;
}> => {
  return unstable_cache(
    async () => {
      const where = buildWhereClause(filters, userId, isAdmin);

      // Executar count e findMany em paralelo
      const [tickets, totalCount] = await Promise.all([
        prisma.ticket.findMany({
          where,
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            deadline: true,
            filial: true,
            user: {
              select: {
                username: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            _count: {
              select: {
                comments: true,
                attachments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: page * pageSize,
          take: pageSize + 1, // Pegar um a mais para verificar se há próxima página
        }),
        prisma.ticket.count({ where }),
      ]);

      // Verificar se há próxima página
      const hasNextPage = tickets.length > pageSize;
      if (hasNextPage) {
        tickets.pop(); // Remover o item extra
      }

      return {
        tickets,
        totalCount,
        hasNextPage,
      };
    },
    [
      `tickets-${JSON.stringify(
        filters
      )}-${page}-${pageSize}-${userId}-${isAdmin}`,
    ],
    {
      revalidate: 60, // Revalidar a cada 60 segundos
      tags: ["tickets", `user-${userId}`],
    }
  )();
};

// Query otimizada para detalhes de um ticket
export const getOptimizedTicketDetails = async (ticketId: string) => {
  return unstable_cache(
    async () => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
          title: true,
          content: true,
          status: true,
          deadline: true,
          filial: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              description: true,
            },
          },
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
      });

      if (!ticket) {
        return null;
      }

      return ticket;
    },
    [`ticket-${ticketId}`],
    {
      revalidate: 30,
      tags: ["tickets", `ticket-${ticketId}`],
    }
  )();
};

// Query otimizada para comentários com paginação
export const getOptimizedComments = async (
  ticketId: string,
  cursor?: string,
  limit: number = 10
) => {
  return unstable_cache(
    async () => {
      const comments = await prisma.comment.findMany({
        where: { ticketId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
      });

      const hasMore = comments.length > limit;
      if (hasMore) {
        comments.pop();
      }

      return {
        comments,
        nextCursor: hasMore ? comments[comments.length - 1].id : null,
      };
    },
    [`comments-${ticketId}-${cursor}-${limit}`],
    {
      revalidate: 30,
      tags: ["comments", `ticket-${ticketId}`],
    }
  )();
};

// Query otimizada para estatísticas do dashboard
export const getOptimizedDashboardStats = async (
  userId?: string,
  isAdmin: boolean = false
) => {
  return unstable_cache(
    async () => {
      const where = isAdmin ? {} : { userId };

      const [total, open, inProgress, completed, recentTickets] =
        await Promise.all([
          prisma.ticket.count({ where }),
          prisma.ticket.count({ where: { ...where, status: "ABERTO" } }),
          prisma.ticket.count({ where: { ...where, status: "EM_ANDAMENTO" } }),
          prisma.ticket.count({ where: { ...where, status: "CONCLUÍDO" } }),
          prisma.ticket.findMany({
            where,
            select: {
              id: true,
              title: true,
              status: true,
              createdAt: true,
              category: {
                select: {
                  name: true,
                  color: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          }),
        ]);

      return {
        stats: {
          total,
          open,
          inProgress,
          completed,
          openPercentage: total > 0 ? Math.round((open / total) * 100) : 0,
          inProgressPercentage:
            total > 0 ? Math.round((inProgress / total) * 100) : 0,
          completedPercentage:
            total > 0 ? Math.round((completed / total) * 100) : 0,
        },
        recentTickets,
      };
    },
    [`dashboard-stats-${userId}-${isAdmin}`],
    {
      revalidate: 60,
      tags: ["dashboard", `user-${userId}`],
    }
  )();
};

// Query otimizada para categorias (com cache longo)
export const getOptimizedCategories = async () => {
  return unstable_cache(
    async () => {
      const categories = await prisma.ticketCategory.findMany({
        select: {
          id: true,
          name: true,
          color: true,
          description: true,
          _count: {
            select: {
              tickets: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return categories;
    },
    ["categories"],
    {
      revalidate: 300, // Cache longo de 5 minutos
      tags: ["categories"],
    }
  )();
};

// Função para invalidar cache quando necessário
export async function invalidateTicketCache(tags?: string[]) {
  const { revalidateTag } = await import("next/cache");

  if (tags) {
    tags.forEach((tag) => revalidateTag(tag));
  } else {
    revalidateTag("tickets");
    revalidateTag("dashboard");
  }
}
