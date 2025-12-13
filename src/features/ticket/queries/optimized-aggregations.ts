import { prisma } from "@/lib/prisma";

// src/features/ticket/queries/optimized-aggregations.ts
export class OptimizedAggregations {
  /**
   * Agregação otimizada usando groupBy
   */
  static async getTicketStatsByFilial(userId?: string) {
    const where = userId ? { userId } : {};

    // Usa groupBy para agregação eficiente
    const stats = await prisma.ticket.groupBy({
      by: ["filial", "status"],
      where,
      _count: {
        id: true,
      },
    });

    // Transforma resultado em estrutura mais útil
    return stats.reduce((acc, stat) => {
      const filial = stat.filial || "Sem Filial";
      if (!acc[filial]) {
        acc[filial] = {
          ABERTO: 0,
          EM_ANDAMENTO: 0,
          CONCLUÍDO: 0,
          total: 0,
        };
      }

      acc[filial][stat.status] = stat._count.id;
      acc[filial].total += stat._count.id;

      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Dashboard stats com única query agregada
   */
  static async getDashboardStats(userId?: string) {
    const where = userId ? { userId } : {};

    // Executa agregação em uma única query
    const [stats, recentTickets] = await prisma.$transaction([
      prisma.ticket.groupBy({
        by: ["status"],
        where,
        _count: { id: true as const },
        orderBy: [{ status: "asc" }],
      }),
      prisma.ticket.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          category: {
            select: { name: true, color: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Processa resultados
    const statusCounts = stats.reduce((acc, stat) => {
      const countId =
        typeof stat._count === "object" && stat._count.id ? stat._count.id : 0;
      acc[stat.status] = countId;
      acc.total = (acc.total || 0) + countId;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...statusCounts,
      recentTickets,
    };
  }
}
