// src/lib/prisma/query-optimizers.ts
import { Prisma } from "@prisma/client";

/**
 * Factory para criar projeções otimizadas de queries
 * Reduz overfetching através de seleção granular de campos
 */
export class PrismaQueryOptimizer {
  /**
   * Cria uma projeção minimalista para listagens
   */
  static ticketListProjection = {
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
  } satisfies Prisma.TicketSelect;

  /**
   * Projeção completa para visualização detalhada
   */
  static ticketDetailProjection = {
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
        email: true,
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
  } satisfies Prisma.TicketSelect;
}
