// src/app/api/dashboard-stats-cached/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CacheService, CacheKeys, CacheTTL } from "@/lib/redis/cache-service";
import { getAuth } from "@/features/auth/queries/get-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Obter usuário autenticado
    const { user } = await getAuth();

    // Chave de cache baseada no usuário (admin vê todos, user vê apenas seus)
    const cacheKey = CacheKeys.dashboardStats(user?.id || "anonymous");

    // Buscar do cache ou calcular
    const stats = await CacheService.get(
      cacheKey,
      async () => {
        // Query base - admin vê todos os tickets, usuário apenas os seus
        const where = user?.role === "ADMIN" ? {} : { userId: user?.id };

        // Executar todas as queries em paralelo para melhor performance
        const [
          totalTickets,
          openTickets,
          inProgressTickets,
          completedTickets,
          totalUsers,
        ] = await Promise.all([
          prisma.ticket.count({ where }),
          prisma.ticket.count({ where: { ...where, status: "ABERTO" } }),
          prisma.ticket.count({ where: { ...where, status: "EM_ANDAMENTO" } }),
          prisma.ticket.count({ where: { ...where, status: "CONCLUÍDO" } }),
          // Contagem de usuários apenas para admins
          user?.role === "ADMIN" ? prisma.user.count() : 0,
        ]);

        // Calcular percentuais
        const openPercentage =
          totalTickets > 0 ? Math.round((openTickets / totalTickets) * 100) : 0;
        const inProgressPercentage =
          totalTickets > 0
            ? Math.round((inProgressTickets / totalTickets) * 100)
            : 0;
        const completedPercentage =
          totalTickets > 0
            ? Math.round((completedTickets / totalTickets) * 100)
            : 0;

        // Simular tendências (em produção, você calcularia com dados históricos)
        const ticketTrend = {
          value: "+12%",
          up: true,
        };

        const userTrend = {
          value: "+5%",
          up: true,
        };

        return {
          stats: {
            tickets: {
              total: totalTickets,
              open: openTickets,
              inProgress: inProgressTickets,
              completed: completedTickets,
              trend: ticketTrend,
            },
            users: {
              total: totalUsers,
              trend: userTrend,
            },
            distribution: {
              open: openPercentage,
              inProgress: inProgressPercentage,
              completed: completedPercentage,
            },
          },
          timestamp: new Date().toISOString(),
        };
      },
      {
        ttl: CacheTTL.SHORT, // Cache por 1 minuto
        tags: ["dashboard", user?.id || "anonymous"],
      }
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
