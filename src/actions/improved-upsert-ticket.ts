"use server";

import { revalidatePath } from "next/cache";
import { setCookieByKey } from "@/actions/cookies";
import {
  ActionState,
  fromErrorToActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { ticketPath, ticketsPath } from "@/paths";

/**
 * Fixed server action for creating/updating tickets that properly handles
 * required Filial and Category fields
 */
export const improvedUpsertTicket = async (
  id: string | undefined,
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    // Get the authenticated user
    const { user } = await getAuthOrRedirect();

    if (!user) {
      return {
        status: "ERROR",
        message: "Usuário não autenticado",
        fieldErrors: {},
        payload: formData,
        timestamp: Date.now(),
      } as ActionState;
    }

    // Get form data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const categoryId = formData.get("categoryId") as string;
    const filial = formData.get("filial") as string;

    // Validate required fields
    const fieldErrors: Record<string, string[]> = {};

    if (!title?.trim()) {
      fieldErrors.title = ["Título é obrigatório"];
    }

    if (!content?.trim()) {
      fieldErrors.content = ["Descrição é obrigatória"];
    }

    if (!categoryId?.trim() || categoryId === "null") {
      fieldErrors.categoryId = ["Categoria é obrigatória"];
    }

    if (!filial?.trim() || filial === "null") {
      fieldErrors.filial = ["Filial é obrigatória"];
    }

    // Return validation errors if any
    if (Object.keys(fieldErrors).length > 0) {
      return {
        status: "ERROR",
        message: "Por favor, preencha todos os campos obrigatórios",
        fieldErrors,
        payload: formData,
        timestamp: Date.now(),
      } as ActionState;
    }

    // Today's date for deadline
    const today = new Date().toISOString().split("T")[0];

    // Create or update the ticket
    let ticket;

    if (id) {
      // Check if existing ticket exists and user has permissions
      const existingTicket = await prisma.ticket.findUnique({ where: { id } });
      if (!existingTicket) {
        return {
          status: "ERROR",
          message: "Ticket não encontrado",
          fieldErrors: {},
          payload: formData,
          timestamp: Date.now(),
        } as ActionState;
      }

      if (user.role !== "ADMIN" && !isOwner(user, existingTicket)) {
        return {
          status: "ERROR",
          message: "Você não tem permissão para editar este ticket",
          fieldErrors: {},
          payload: formData,
          timestamp: Date.now(),
        } as ActionState;
      }

      // Update ticket with required fields - note we don't need null handling
      // since these fields are required now
      ticket = await prisma.ticket.update({
        where: { id },
        data: {
          title,
          content,
          deadline: today,
          categoryId,
          filial,
        },
      });
    } else {
      // Create new ticket with required fields
      ticket = await prisma.ticket.create({
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
    }

    // Revalidate paths and set success toast
    revalidatePath(ticketsPath());

    if (id) {
      await setCookieByKey("toast", "Ticket atualizado com sucesso");
      return {
        status: "SUCCESS",
        message: "Ticket atualizado com sucesso",
        fieldErrors: {},
        timestamp: Date.now(),
        data: { id, nextRedirect: ticketPath(id) },
      } as ActionState & { data: { id: string; nextRedirect: string } };
    } else {
      await setCookieByKey("toast", "Ticket criado com sucesso");
      return {
        status: "SUCCESS",
        message: "Ticket criado com sucesso",
        fieldErrors: {},
        timestamp: Date.now(),
        ticketId: ticket.id,
        data: { id: ticket.id, nextRedirect: ticketPath(ticket.id) },
      } as ActionState & {
        ticketId: string;
        data: { id: string; nextRedirect: string };
      };
    }
  } catch (error) {
    console.error("Error in upsertTicket:", error);

    // If the error is a Prisma Foreign Key Constraint error, provide a more helpful message
    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint failed")
    ) {
      return {
        status: "ERROR",
        success: false,
        message:
          "Erro de chave estrangeira: Certifique-se de que a categoria selecionada existe no banco de dados.",
        fieldErrors: {
          categoryId: ["Categoria inválida ou não existente"],
        },
        payload: formData,
        timestamp: Date.now(),
        data: null,
      } as ActionState;
    }

    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }

    return fromErrorToActionState(error, formData);
  }
};
