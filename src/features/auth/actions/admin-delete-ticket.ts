"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";

/**
 * Admin-specific delete ticket action that returns a response object
 * instead of redirecting, making it suitable for client components
 */
export async function adminDeleteTicket(id: string) {
  try {
    // Get the authenticated user
    const { user } = await getAuth();

    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Verify admin role
    if (user.role !== "ADMIN") {
      return {
        success: false,
        error: "Somente administradores podem excluir tickets",
      };
    }

    // Get the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return {
        success: false,
        error: "Ticket não encontrado",
      };
    }

    // Delete the ticket
    await prisma.ticket.delete({
      where: { id },
    });

    // Revalidate the tickets path
    revalidatePath(ticketsPath());

    // Return success response
    return {
      success: true,
      message: "Ticket deletado com sucesso",
    };
  } catch (error) {
    console.error("Erro ao excluir ticket:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Falha ao excluir ticket",
    };
  }
}
