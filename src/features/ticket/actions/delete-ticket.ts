"use server";

import { revalidatePath } from "next/cache";
import { setCookieByKey } from "@/actions/cookies";
import {
  ActionState,
  fromErrorToActionState,
} from "@/components/form/utils/to-action-state";
import { getAuth } from "@/features/auth/queries/get-auth";
import { isOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";

export const deleteTicket = async (id: string): Promise<ActionState> => {
  try {
    // Get the authenticated user
    const { user } = await getAuth();

    if (!user) {
      return {
        status: "ERROR",
        message: "Usuário não autenticado",
        fieldErrors: {},
        timestamp: Date.now(),
      } as ActionState;
    }

    // Get the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return {
        status: "ERROR",
        message: "Ticket não encontrado",
        fieldErrors: {},
        timestamp: Date.now(),
      } as ActionState;
    }

    // Check if user is admin or the owner
    if (user.role !== "ADMIN" && !isOwner(user, ticket)) {
      return {
        status: "ERROR",
        message: "Você não tem permissão para deletar este ticket",
        fieldErrors: {},
        timestamp: Date.now(),
      } as ActionState;
    }

    await prisma.ticket.delete({
      where: { id },
    });

    revalidatePath(ticketsPath());
    await setCookieByKey("toast", "Ticket deletado com sucesso");

    return {
      status: "SUCCESS",
      message: "Ticket deletado com sucesso",
      fieldErrors: {},
      timestamp: Date.now(),
    } as ActionState;
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
