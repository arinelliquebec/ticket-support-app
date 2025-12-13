"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { setCookieByKey } from "@/actions/cookies";
import {
  ActionState,
  EMPTY_ACTION_STATE,
  fromErrorToActionState,
} from "@/components/form/utils/to-action-state";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import { ticketPath, ticketsPath } from "@/paths";
import { ticketSchema } from "@/validations/ticket-schema";

/**
 * Middleware de validação para server actions
 */
function withValidation<T extends z.ZodType<any, any>>(
  schema: T,
  handler: (validData: z.infer<T>, formData: FormData) => Promise<ActionState>
) {
  return async (
    prevState: ActionState,
    formData: FormData
  ): Promise<ActionState> => {
    try {
      // Extrair dados do FormData para um objeto simples
      const rawData: Record<string, any> = {};
      formData.forEach((value, key) => {
        rawData[key] = value;
      });

      // Validar dados com o esquema Zod
      const parseResult = schema.safeParse(rawData);

      if (!parseResult.success) {
        // Transformar erros do Zod em formato compatível com ActionState
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
          message: "Por favor, corrija os erros do formulário",
          fieldErrors,
          timestamp: Date.now(),
          success: false,
          data: null,
        };
      }

      // Se a validação passou, continue com o handler
      return await handler(parseResult.data, formData);
    } catch (error) {
      // Capturar exceções e formatar como ActionState
      return fromErrorToActionState(error, formData);
    }
  };
}

/**
 * Handler para processar dados validados do ticket
 */
async function handleValidatedTicket(
  validData: z.infer<typeof ticketSchema>,
  formData: FormData
): Promise<ActionState> {
  try {
    // Get the authenticated user
    const { user } = await getAuth();

    if (!user) {
      return {
        status: "ERROR",
        message: "Usuário não autenticado",
        fieldErrors: {},
        timestamp: Date.now(),
        success: false,
        data: null,
      };
    }

    // Extract ticket ID if updating
    const ticketId = formData.get("id") as string | undefined;

    // Add today as deadline
    const today = new Date().toISOString().split("T")[0];

    // If categoryId is provided, verify it exists
    if (validData.categoryId) {
      const category = await prisma.ticketCategory.findUnique({
        where: { id: validData.categoryId },
      });

      if (!category) {
        return {
          status: "ERROR",
          message: `Categoria com ID ${validData.categoryId} não encontrada`,
          fieldErrors: {
            categoryId: ["Categoria não encontrada"],
          },
          timestamp: Date.now(),
          success: false,
          data: null,
        };
      }
    }

    let ticket;

    // Update or create ticket based on ticketId presence
    if (ticketId) {
      // Get existing ticket
      const existingTicket = await prisma.ticket.findUnique({
        where: { id: ticketId },
      });

      if (!existingTicket) {
        return {
          status: "ERROR",
          message: "Ticket não encontrado",
          fieldErrors: {},
          timestamp: Date.now(),
          success: false,
          data: null,
        };
      }

      // Check permission
      if (user.role !== "ADMIN" && existingTicket.userId !== user.id) {
        return {
          status: "ERROR",
          message: "Você não tem permissão para editar este ticket",
          fieldErrors: {},
          timestamp: Date.now(),
          success: false,
          data: null,
        };
      }

      // Update ticket
      ticket = await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          title: validData.title,
          content: validData.content,
          categoryId: validData.categoryId,
          filial: validData.filial,
          deadline: today,
        },
      });

      await setCookieByKey("toast", "Ticket atualizado com sucesso");
    } else {
      // Create new ticket
      ticket = await prisma.ticket.create({
        data: {
          title: validData.title,
          content: validData.content,
          userId: user.id,
          status: "ABERTO",
          deadline: today,
          categoryId: validData.categoryId,
          filial: validData.filial,
        },
      });

      await setCookieByKey("toast", "Ticket criado com sucesso");
    }

    // Revalidate tickets path
    revalidatePath(ticketsPath());

    // Return success with data properly nested in the data property
    return {
      status: "SUCCESS",
      message: ticketId
        ? "Ticket atualizado com sucesso"
        : "Ticket criado com sucesso",
      fieldErrors: {},
      timestamp: Date.now(),
      success: true,
      data: {
        id: ticket.id,
        ticketId: ticket.id,
        nextRedirect: `${ticketPath(ticket.id)}?new=${!ticketId}`,
      },
    };
  } catch (error) {
    console.error("Error in validated ticket action:", error);

    // Se for um erro de redirecionamento, deixar propagar
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }

    // Outros erros são formatados como ActionState
    return fromErrorToActionState(error, formData);
  }
}

/**
 * Server Action com validação usando o esquema de tickets
 */
export const createOrUpdateValidatedTicket = withValidation(
  ticketSchema,
  handleValidatedTicket
);

/**
 * Server Action para criar ticket com redirecionamento
 */
export async function createTicketWithRedirect(formData: FormData) {
  const result = await createOrUpdateValidatedTicket(
    EMPTY_ACTION_STATE,
    formData
  );

  if (result.status === "SUCCESS" && result.data?.ticketId) {
    // Se for sucesso e tiver ticketId no data, redirecionar
    redirect(`${ticketPath(result.data.ticketId)}?new=true`);
  }

  return result;
}
