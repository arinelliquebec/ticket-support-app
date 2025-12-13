// src/app/api/dashboard-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";

// Importar o serviço de cache - CERTIFIQUE-SE DE QUE ESTE ARQUIVO EXISTE!
// Se não existir, comente as linhas de cache por enquanto
let CacheService: any;
let CacheKeys: any;
let CacheTTL: any;

try {
  const cacheModule = require("@/lib/redis/cache-service");
  CacheService = cacheModule.CacheService;
  CacheKeys = cacheModule.CacheKeys;
  CacheTTL = cacheModule.CacheTTL;
} catch (error) {
  console.warn("Cache service not found, running without cache");
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Função para buscar os dados
    const fetchStats = async () => {
      // Obter usuário autenticado
      const { user } = await getAuth();

      // Query base - admin vê todos os tickets, usuário apenas os seus
      const where =
        user?.role === "ADMIN" ? {} : user ? { userId: user.id } : {};

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
    };

    // Se o cache estiver disponível, usar
    if (CacheService && CacheKeys) {
      const { user } = await getAuth();
      const cacheKey = CacheKeys.dashboardStats(user?.id || "anonymous");

      const stats = await CacheService.get(cacheKey, fetchStats, {
        ttl: CacheTTL?.SHORT || 60, // 1 minuto
        tags: ["dashboard", user?.id || "anonymous"],
      });

      return NextResponse.json(stats);
    } else {
      // Sem cache, buscar diretamente
      const stats = await fetchStats();
      return NextResponse.json(stats);
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
