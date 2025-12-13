import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";

export const dynamic = "force-dynamic"; // no caching for always having updated data

export async function GET(request: NextRequest) {
  try {
    // Verify if user is authenticated and is admin
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Fetch user data
    const totalUsers = await prisma.user.count();
    const adminUsers = await prisma.user.count({
      where: { role: "ADMIN" },
    });
    const regularUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    // Fetch recent users
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      take: 5,
    });

    // Fetch ticket data
    const totalTickets = await prisma.ticket.count();
    const openTickets = await prisma.ticket.count({
      where: { status: "ABERTO" },
    });
    const inProgressTickets = await prisma.ticket.count({
      where: { status: "EM_ANDAMENTO" },
    });
    const completedTickets = await prisma.ticket.count({
      where: { status: "CONCLUÍDO" },
    });

    // Get tickets count by filial
    const ticketsByFilial = await prisma.ticket.groupBy({
      by: ["filial"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Format filial stats
    const filialStats = ticketsByFilial.map((stat) => ({
      filial: stat.filial || "Sem Filial",
      count: stat._count.id,
      percentage: ((stat._count.id / totalTickets) * 100).toFixed(1),
    }));

    // Fetch recent tickets
    const recentTickets = await prisma.ticket.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        deadline: true,
        filial: true, // Include filial
        createdAt: true,
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Calculate additional statistics
    const ticketsPerStatus = {
      open: (openTickets / totalTickets) * 100 || 0,
      inProgress: (inProgressTickets / totalTickets) * 100 || 0,
      completed: (completedTickets / totalTickets) * 100 || 0,
    };

    const userStats = {
      total: totalUsers,
      admins: adminUsers,
      regular: regularUsers,
      adminPercentage: (adminUsers / totalUsers) * 100 || 0,
      regularPercentage: (regularUsers / totalUsers) * 100 || 0,
      recent: recentUsers,
    };

    const ticketStats = {
      total: totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      completed: completedTickets,
      percentages: ticketsPerStatus,
      recent: recentTickets,
      byFilial: filialStats, // Add filial statistics
    };

    // Return all data as JSON
    return NextResponse.json({
      users: userStats,
      tickets: ticketStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch admin statistics" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
