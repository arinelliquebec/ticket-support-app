"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { setCookieByKey } from "@/actions/cookies";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { ticketPath, ticketsPath } from "@/paths";

// Updated schema with required fields
const upsertTicketSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(191, "Título deve ter no máximo 191 caracteres"),
  content: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(1024, "Descrição deve ter no máximo 1024 caracteres"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  filial: z.string().min(1, "Filial é obrigatória"),
});

export const upsertTicket = async (
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

    // Extract form data for validation
    const rawData = {
      title: formData.get("title"),
      content: formData.get("content"),
      categoryId: formData.get("categoryId"),
      filial: formData.get("filial"),
    };

    // Validate with Zod schema
    const parseResult = upsertTicketSchema.safeParse(rawData);

    if (!parseResult.success) {
      // Transform Zod errors to ActionState format
      const fieldErrors: Record<string, string[]> = {};
      parseResult.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
      });

      return {
        status: "ERROR" as const,
        message: "Por favor, preencha todos os campos obrigatórios.",
        fieldErrors,
        payload: formData,
        timestamp: Date.now(),
      };
    }

    // Get validated form data
    const { title, content, categoryId, filial } = parseResult.data;

    // Get today's date for deadline
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

      // Update the ticket with validated data
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
      // Create new ticket with validated data
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
        data: { id: ticket.id, nextRedirect: ticketPath(ticket.id) },
      } as ActionState & { data: { id: string; nextRedirect: string } };
    }
  } catch (error) {
    console.error("Error in upsertTicket:", error);

    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }

    // Handle foreign key constraint errors specifically
    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint failed")
    ) {
      return {
        status: "ERROR",
        message:
          "Categoria selecionada é inválida ou não existe no banco de dados",
        fieldErrors: {
          categoryId: ["Categoria inválida ou não existente"],
        },
        payload: formData,
        timestamp: Date.now(),
        success: false,
        data: null,
      } as ActionState;
    }

    const errorState = fromErrorToActionState(error, formData);
    return {
      ...errorState,
      payload: formData,
    };
  }
};
