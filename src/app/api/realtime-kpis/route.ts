import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";

// Restricted to specific email only
const ALLOWED_EMAIL = "arinpar@gmail.com";

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuth();

    // Check authentication
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has permission (restricted email only)
    if (user.email !== ALLOWED_EMAIL) {
      return NextResponse.json(
        { error: "Forbidden - Este recurso é exclusivo" },
        { status: 403 }
      );
    }

    // Get current date ranges
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);
    const last7Days = new Date();
    last7Days.setDate(now.getDate() - 7);

    // Fetch all KPIs in parallel
    const [
      totalTickets,
      totalTicketsLast30,
      openTickets,
      inProgressTickets,

      ticketsToday,
      ticketsYesterday,
      completedLast7Days,
      totalLast7Days,
      activeAdmins,
      avgResponseTimeData,
      slaData,
      recentActivities
    ] = await Promise.all([
      // Total tickets
      prisma.ticket.count(),
      
      // Total tickets last 30 days (for comparison)
      prisma.ticket.count({
        where: {
          createdAt: { gte: last30Days }
        }
      }),
      
      // Open tickets
      prisma.ticket.count({
        where: { status: "ABERTO" }
      }),
      
      // In progress tickets
      prisma.ticket.count({
        where: { status: "EM_ANDAMENTO" }
      }),
      
      // Tickets created today
      prisma.ticket.count({
        where: {
          createdAt: { gte: startOfToday }
        }
      }),
      
      // Tickets created yesterday (for comparison)
      prisma.ticket.count({
        where: {
          createdAt: {
            gte: startOfYesterday,
            lt: startOfToday
          }
        }
      }),
      
      // Completed tickets last 7 days
      prisma.ticket.count({
        where: {
          status: "CONCLUÍDO",
          updatedAt: { gte: last7Days }
        }
      }),
      
      // Total tickets last 7 days
      prisma.ticket.count({
        where: {
          createdAt: { gte: last7Days }
        }
      }),
      
      // Active admins (who have acted on tickets recently)
      prisma.user.count({
        where: {
          role: "ADMIN",
          OR: [
            {
              comments: {
                some: {
                  createdAt: { gte: last7Days }
                }
              }
            },
            {
              tickets: {
                some: {
                  createdAt: { gte: last7Days }
                }
              }
            }
          ]
        }
      }),
      
      // Average response time calculation
      prisma.ticket.findMany({
        where: {
          createdAt: { gte: last30Days },
          comments: {
            some: {
              user: {
                role: "ADMIN"
              }
            }
          }
        },
        include: {
          comments: {
            where: {
              user: {
                role: "ADMIN"
              }
            },
            orderBy: { createdAt: "asc" },
            take: 1
          }
        }
      }),
      
      // SLA compliance data
      prisma.ticket.findMany({
        where: {
          status: "CONCLUÍDO",
          updatedAt: { gte: last30Days }
        },
        select: {
          createdAt: true,
          updatedAt: true,
          priority: true
        }
      }),
      
      // Recent activities
      prisma.ticket.findMany({
        where: {
          OR: [
            { createdAt: { gte: last7Days } },
            { updatedAt: { gte: last7Days } }
          ]
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
          user: {
            select: { username: true }
          },
          comments: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              user: {
                select: { username: true }
              }
            }
          }
        }
      })
    ]);

    // Calculate average response time
    let totalResponseTime = 0;
    let responseCount = 0;
    
    avgResponseTimeData.forEach((ticket) => {
      if (ticket.comments.length > 0) {
        const responseTime = 
          ticket.comments[0].createdAt.getTime() - ticket.createdAt.getTime();
        totalResponseTime += responseTime / (1000 * 60 * 60); // Convert to hours
        responseCount++;
      }
    });
    
    const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : null;

    // Calculate SLA compliance
    let slaCompliant = 0;
    const slaTarget = 120; // 120 hours for BAIXA
    
    slaData.forEach((ticket) => {
      const resolutionTime = 
        (ticket.updatedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
      if (resolutionTime <= slaTarget) {
        slaCompliant++;
      }
    });
    
    const slaCompliance = slaData.length > 0 
      ? Math.round((slaCompliant / slaData.length) * 100)
      : 0;

    // Calculate resolution rate
    const resolutionRate = totalLast7Days > 0
      ? Math.round((completedLast7Days / totalLast7Days) * 100)
      : 0;

    // Calculate percentage changes
    const ticketsTodayChange = ticketsYesterday > 0
      ? ((ticketsToday - ticketsYesterday) / ticketsYesterday) * 100
      : 0;

    // Transform recent activities
    const activities = recentActivities.map(ticket => {
      const lastComment = ticket.comments[0];
      if (lastComment && 
          new Date().getTime() - lastComment.createdAt.getTime() < 24 * 60 * 60 * 1000) {
        return {
          type: "comment_added",
          description: `Comentário adicionado ao ticket #${ticket.id.slice(0, 8)}`,
          timestamp: lastComment.createdAt,
          user: lastComment.user?.username,
          ticketId: ticket.id
        };
      }
      
      if (ticket.status === "CONCLUÍDO" && 
          new Date().getTime() - ticket.updatedAt.getTime() < 24 * 60 * 60 * 1000) {
        return {
          type: "ticket_resolved",
          description: `Ticket #${ticket.id.slice(0, 8)} resolvido`,
          timestamp: ticket.updatedAt,
          ticketId: ticket.id
        };
      }
      
      if (new Date().getTime() - ticket.createdAt.getTime() < 24 * 60 * 60 * 1000) {
        return {
          type: "ticket_created",
          description: `Novo ticket: ${ticket.title}`,
          timestamp: ticket.createdAt,
          user: ticket.user?.username,
          ticketId: ticket.id,
          priority: ticket.priority
        };
      }
      
      return null;
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        // Core metrics
        totalTickets,
        openTickets,
        inProgressTickets,
        ticketsToday,
        activeAdmins,
        
        // Calculated metrics
        avgResponseTime,
        slaCompliance,
        resolutionRate,
        
        // Changes
        ticketsTodayChange: Math.round(ticketsTodayChange),
        
        // Recent activities
        recentActivities: activities
      }
    });
  } catch (error) {
    console.error("Error fetching realtime KPIs:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
