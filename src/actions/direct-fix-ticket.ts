"use server";

import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";

/**
 * Direct ticket creation action with debug logging to diagnose and fix the categoryId issue
 */
export async function directFixTicket(formData: FormData) {
  try {
    // Get authenticated user
    const { user } = await getAuth();
    if (!user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Extract form data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const categoryIdRaw = formData.get("categoryId");
    const filialRaw = formData.get("filial");

    // Force categoryId to be explicitly null if empty/falsy
    const categoryId =
      categoryIdRaw && categoryIdRaw !== "" ? String(categoryIdRaw) : null;

    // Handle filial the same way
    const filial = filialRaw && filialRaw !== "" ? String(filialRaw) : null;

    // Add today as deadline
    const today = new Date().toISOString().split("T")[0];

    // Check if categoryId exists if it's not null
    if (categoryId) {
      const category = await prisma.ticketCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return {
          success: false,
          error: `Category with ID ${categoryId} not found`,
        };
      }
    }

    // Create the ticket using the Prisma client directly with null values
    const ticket = await prisma.ticket.create({
      data: {
        title,
        content,
        userId: user.id,
        status: "ABERTO",
        deadline: today,
        categoryId,
        filial,
      },
    });

    return {
      success: true,
      message: "Ticket criado com sucesso!",
      ticketId: ticket.id,
      data: ticket,
    };
  } catch (error) {
    console.error("ERRO - Falha ao criar ticket:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      errorObject: error,
    };
  }
}
