"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

/**
 * Advanced metrics for ticket system
 * Includes response time, resolution time, SLA compliance, and more
 */

type TimeRange = "7d" | "30d" | "90d" | "all";

interface AdvancedMetrics {
  // Response and Resolution Times
  averageResponseTime: number | null; // in hours
  averageResolutionTime: number | null; // in hours

  // SLA Metrics
  slaCompliance: {
    total: number;
    onTime: number;
    percentage: number;
  };

  // Volume Metrics
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  completedTickets: number;

  // Distribution
  byPriority: Array<{ priority: string; count: number; percentage: number }>;
  byCategory: Array<{ category: string; count: number; percentage: number }>;
  byFilial: Array<{ filial: string; count: number; percentage: number }>;

  // Trends
  ticketsPerDay: Array<{ date: string; count: number }>;

  // Top Categories
  topCategories: Array<{
    name: string;
    count: number;
    avgResolutionTime: number;
  }>;

  // Performance
  responseTimeByPriority: Array<{ priority: string; avgTime: number }>;

  // Admin Performance (Individual metrics per admin)
  adminMetrics: Array<{
    adminId: string;
    adminName: string;
    adminEmail: string;
    ticketsResponded: number;
    avgResponseTime: number | null;
    ticketsResolved: number;
    avgResolutionTime: number | null;
    slaCompliance: number;
  }>;
}

// Temporarily bypassing cache for debugging
export const getAdvancedMetrics = async (
  timeRange: TimeRange = "30d"
): Promise<AdvancedMetrics> => {
  console.log(
    `[Advanced Metrics] Starting calculation for range: ${timeRange}`
  );

  try {
    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "all":
        startDate = new Date(0); // Beginning of time
        break;
    }

    console.log(
      `[Advanced Metrics] Date range: ${startDate.toISOString()} to ${now.toISOString()}`
    );

    // Base where clause
    const whereClause = {
      createdAt: {
        gte: startDate,
      },
    };

    console.log("[Advanced Metrics] Step 1: Fetching tickets with comments...");

    // 1. Get all tickets with comments for response time calculation
    const ticketsWithComments = await prisma.ticket.findMany({
      where: {
        ...whereClause,
        comments: {
          some: {},
        },
      },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
          take: 1,
          include: {
            user: {
              select: { id: true, role: true },
            },
          },
        },
      },
    });

    console.log(
      `[Advanced Metrics] Step 1 completed: ${ticketsWithComments.length} tickets found`
    );
    console.log("[Advanced Metrics] Step 2: Calculating response times...");

    // Calculate average response time (time to first admin comment)
    let totalResponseTime = 0;
    let responseCount = 0;

    ticketsWithComments.forEach((ticket) => {
      const firstComment = ticket.comments[0];
      if (firstComment && firstComment.user?.role === "ADMIN") {
        const responseTime =
          firstComment.createdAt.getTime() - ticket.createdAt.getTime();
        totalResponseTime += responseTime / (1000 * 60 * 60); // Convert to hours
        responseCount++;
      }
    });

    const averageResponseTime =
      responseCount > 0 ? totalResponseTime / responseCount : null;

    console.log("[Advanced Metrics] Step 3: Fetching completed tickets...");

    // 2. Calculate average resolution time (time to completion)
    const completedTickets = await prisma.ticket.findMany({
      where: {
        ...whereClause,
        status: "CONCLUÍDO",
      },
    });

    let totalResolutionTime = 0;
    completedTickets.forEach((ticket) => {
      const resolutionTime =
        ticket.updatedAt.getTime() - ticket.createdAt.getTime();
      totalResolutionTime += resolutionTime / (1000 * 60 * 60); // Convert to hours
    });

    const averageResolutionTime =
      completedTickets.length > 0
        ? totalResolutionTime / completedTickets.length
        : null;

    // 3. SLA Compliance (Standard: 120h for BAIXA)
    const slaTarget = 120;
    
    const slaCompliance = {
      total: completedTickets.length,
      onTime: 0,
      percentage: 0
    };

    completedTickets.forEach((ticket) => {
      const resolutionTime =
        (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) /
        (1000 * 60 * 60);
      if (resolutionTime <= slaTarget) {
        slaCompliance.onTime++;
      }
    });

    slaCompliance.percentage =
      slaCompliance.total > 0
        ? Math.round((slaCompliance.onTime / slaCompliance.total) * 100)
        : 0;

    // 4. Volume metrics
    const [totalTickets, openTickets, inProgressTickets, completedCount] =
      await Promise.all([
        prisma.ticket.count({ where: whereClause }),
        prisma.ticket.count({ where: { ...whereClause, status: "ABERTO" } }),
        prisma.ticket.count({
          where: { ...whereClause, status: "EM_ANDAMENTO" },
        }),
        prisma.ticket.count({
          where: { ...whereClause, status: "CONCLUÍDO" },
        }),
      ]);

    // 5. Distribution by priority
    const priorityDistribution = await prisma.ticket.groupBy({
      by: ["priority"],
      where: whereClause,
      _count: true,
    });

    const byPriority = priorityDistribution.map((item) => ({
      priority: item.priority,
      count: item._count,
      percentage: Math.round((item._count / totalTickets) * 100),
    }));

    // 6. Distribution by category
    const categoryDistribution = await prisma.ticket.groupBy({
      by: ["categoryId"],
      where: whereClause,
      _count: true,
    });

    const categories = await prisma.ticketCategory.findMany({
      where: {
        id: {
          in: categoryDistribution
            .map((c) => c.categoryId)
            .filter((id): id is string => id !== null),
        },
      },
    });

    const byCategory = categoryDistribution
      .filter((item) => item.categoryId !== null)
      .map((item) => {
        const category = categories.find((c) => c.id === item.categoryId);
        return {
          category: category?.name || "Sem categoria",
          count: item._count,
          percentage: Math.round((item._count / totalTickets) * 100),
        };
      });

    // 7. Distribution by filial
    const filialDistribution = await prisma.ticket.groupBy({
      by: ["filial"],
      where: whereClause,
      _count: true,
    });

    const byFilial = filialDistribution
      .filter((item) => item.filial !== null)
      .map((item) => ({
        filial: item.filial || "Sem filial",
        count: item._count,
        percentage: Math.round((item._count / totalTickets) * 100),
      }));

    // 8. Tickets per day (last 30 days)
    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);

    const ticketsPerDayRaw = await prisma.$queryRaw<
      Array<{ date: Date; count: bigint }>
    >`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "Ticket"
      WHERE "createdAt" >= ${last30Days}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    const ticketsPerDay = ticketsPerDayRaw.map((item) => ({
      date: item.date.toISOString().split("T")[0],
      count: Number(item.count),
    }));

    // 9. Top categories with avg resolution time
    const topCategoriesData = await prisma.ticket.groupBy({
      by: ["categoryId"],
      where: {
        ...whereClause,
        status: "CONCLUÍDO",
        categoryId: { not: null },
      },
      _count: true,
    });

    const topCategoriesWithTime = await Promise.all(
      topCategoriesData.slice(0, 5).map(async (item) => {
        const category = await prisma.ticketCategory.findUnique({
          where: { id: item.categoryId! },
        });

        const categoryTickets = await prisma.ticket.findMany({
          where: {
            ...whereClause,
            categoryId: item.categoryId,
            status: "CONCLUÍDO",
          },
        });

        let totalTime = 0;
        categoryTickets.forEach((ticket) => {
          totalTime +=
            (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) /
            (1000 * 60 * 60);
        });

        return {
          name: category?.name || "Desconhecido",
          count: item._count,
          avgResolutionTime:
            categoryTickets.length > 0 ? totalTime / categoryTickets.length : 0,
        };
      })
    );

    // 10. Response time by priority
    const responseTimeByPriority = await Promise.all(
      ["BAIXA"].map(async (priority) => {
        const tickets = ticketsWithComments.filter(
          (t) => t.priority === priority
        );

        let totalTime = 0;
        let count = 0;

        tickets.forEach((ticket) => {
          const firstComment = ticket.comments[0];
          if (firstComment && firstComment.user?.role === "ADMIN") {
            totalTime +=
              (firstComment.createdAt.getTime() - ticket.createdAt.getTime()) /
              (1000 * 60 * 60);
            count++;
          }
        });

        return {
          priority,
          avgTime: count > 0 ? totalTime / count : 0,
        };
      })
    );

    console.log("[Advanced Metrics] Step 11: Calculating admin metrics...");

    // 11. Admin Performance Metrics (Individual)
    let adminMetrics: Array<{
      adminId: string;
      adminName: string;
      adminEmail: string;
      ticketsResponded: number;
      avgResponseTime: number | null;
      ticketsResolved: number;
      avgResolutionTime: number | null;
      slaCompliance: number;
    }> = [];

    try {
      const admins = await prisma.user.findMany({
        where: {
          role: "ADMIN",
        },
        select: {
          id: true,
          username: true,
          email: true,
        },
      });

      adminMetrics = await Promise.all(
        admins.map(async (admin) => {
          // Get all tickets where this admin was the first responder
          const ticketsRespondedTo = ticketsWithComments.filter((ticket) => {
            const firstComment = ticket.comments[0];
            return firstComment && firstComment.user?.id === admin.id;
          });

          // Calculate average response time
          let totalResponseTime = 0;
          ticketsRespondedTo.forEach((ticket) => {
            const firstComment = ticket.comments[0];
            if (firstComment) {
              totalResponseTime +=
                (firstComment.createdAt.getTime() -
                  ticket.createdAt.getTime()) /
                (1000 * 60 * 60);
            }
          });

          const avgResponseTime =
            ticketsRespondedTo.length > 0
              ? totalResponseTime / ticketsRespondedTo.length
              : null;

          // Get tickets resolved by this admin (where admin made last comment before completion)
          const ticketsResolvedByAdmin = await prisma.ticket.findMany({
            where: {
              ...whereClause,
              status: "CONCLUÍDO",
              comments: {
                some: {
                  userId: admin.id,
                },
              },
            },
            include: {
              comments: {
                orderBy: { createdAt: "desc" },
                take: 1,
                where: {
                  userId: admin.id,
                },
              },
            },
          });

          // Calculate average resolution time for tickets resolved by this admin
          let totalResolutionTime = 0;
          ticketsResolvedByAdmin.forEach((ticket) => {
            totalResolutionTime +=
              (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) /
              (1000 * 60 * 60);
          });

          const avgResolutionTime =
            ticketsResolvedByAdmin.length > 0
              ? totalResolutionTime / ticketsResolvedByAdmin.length
              : null;

          // Calculate SLA compliance for tickets handled by this admin
          const slaTarget = 120; // 120h for BAIXA

          let slaCompliantTickets = 0;
          let totalSlaTickets = ticketsResolvedByAdmin.length;

          ticketsResolvedByAdmin.forEach((ticket) => {
              const resolutionTime =
                (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) /
                (1000 * 60 * 60);
              if (resolutionTime <= slaTarget) {
                slaCompliantTickets++;
              }
          });

          const slaCompliance =
            totalSlaTickets > 0
              ? Math.round((slaCompliantTickets / totalSlaTickets) * 100)
              : 0;

          return {
            adminId: admin.id,
            adminName: admin.username,
            adminEmail: admin.email,
            ticketsResponded: ticketsRespondedTo.length,
            avgResponseTime,
            ticketsResolved: ticketsResolvedByAdmin.length,
            avgResolutionTime,
            slaCompliance,
          };
        })
      );

      // Sort by tickets resolved (descending)
      adminMetrics.sort((a, b) => b.ticketsResolved - a.ticketsResolved);
      console.log(
        `[Advanced Metrics] Admin metrics completed: ${adminMetrics.length} admins`
      );
    } catch (error) {
      console.error(
        "[Advanced Metrics] Error calculating admin metrics:",
        error
      );
      if (error instanceof Error) {
        console.error(
          "[Advanced Metrics] Admin metrics error message:",
          error.message
        );
      }
      // Continue with empty admin metrics if there's an error
      adminMetrics = [];
    }

    console.log("[Advanced Metrics] Calculation completed successfully");

    return {
      averageResponseTime,
      averageResolutionTime,
      slaCompliance,
      totalTickets,
      openTickets,
      inProgressTickets,
      completedTickets: completedCount,
      byPriority,
      byCategory,
      byFilial,
      ticketsPerDay,
      topCategories: topCategoriesWithTime,
      responseTimeByPriority,
      adminMetrics,
    };
  } catch (error) {
    console.error("[Advanced Metrics] Critical error:", error);
    if (error instanceof Error) {
      console.error("[Advanced Metrics] Error message:", error.message);
      console.error("[Advanced Metrics] Error stack:", error.stack);
    }
    throw error; // Re-throw to be caught by API endpoint
  }
};
