"use server";

import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";
import { revalidateTag } from "next/cache";
import { eventBus } from "@/lib/realtime/event-bus";

/**
 * Mark a ticket as viewed by admin
 * Only admins can mark tickets as viewed
 */
export async function markTicketAsViewed(ticketId: string) {
  try {
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Apenas administradores podem marcar tickets como visualizados",
      };
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { viewedByAdmin: true },
    });

    // Broadcast real-time event
    eventBus.broadcast({
      type: "ticket:updated",
      adminOnly: true,
      data: {
        ticketId,
        viewedByAdmin: true,
      },
      timestamp: Date.now(),
    });

    // Revalidate admin notifications cache
    revalidateTag("admin-notifications");
    revalidateTag("tickets");

    return {
      success: true,
      message: "Ticket marcado como visualizado",
    };
  } catch (error) {
    console.error("Error marking ticket as viewed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao marcar ticket",
    };
  }
}

/**
 * Mark multiple tickets as viewed
 */
export async function markMultipleTicketsAsViewed(ticketIds: string[]) {
  try {
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Apenas administradores podem marcar tickets como visualizados",
      };
    }

    await prisma.ticket.updateMany({
      where: {
        id: { in: ticketIds },
      },
      data: { viewedByAdmin: true },
    });

    // Revalidate admin notifications cache
    revalidateTag("admin-notifications");
    revalidateTag("tickets");

    return {
      success: true,
      message: `${ticketIds.length} ticket(s) marcado(s) como visualizado(s)`,
    };
  } catch (error) {
    console.error("Error marking tickets as viewed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao marcar tickets",
    };
  }
}

/**
 * Mark all unviewed tickets as viewed
 */
export async function markAllTicketsAsViewed() {
  try {
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Apenas administradores podem marcar tickets como visualizados",
      };
    }

    const result = await prisma.ticket.updateMany({
      where: {
        viewedByAdmin: false,
      },
      data: { viewedByAdmin: true },
    });

    // Revalidate admin notifications cache
    revalidateTag("admin-notifications");
    revalidateTag("tickets");

    return {
      success: true,
      message: `${result.count} ticket(s) marcado(s) como visualizado(s)`,
      count: result.count,
    };
  } catch (error) {
    console.error("Error marking all tickets as viewed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao marcar tickets",
    };
  }
}
