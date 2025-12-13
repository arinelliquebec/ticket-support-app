"use server";

import { after } from "next/server";

import { TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ActionState,
  fromErrorToActionState,
} from "@/components/form/utils/to-action-state";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";
import { sendTicketCompletedEmails } from "@/services/email-service";

export const updateTicketStatus = async (id: string, status: TicketStatus) => {
  try {
    // Get the authenticated user
    const { user } = await getAuth();

    if (!user) {
      redirect("/sign-in");
    }

    // Only admins can update status
    if (user.role !== "ADMIN") {
      return {
        status: "ERROR",
        message: "Somente administradores podem atualizar o status",
        fieldErrors: {},
        timestamp: Date.now(),
      } as ActionState;
    }

    // Get ticket with user details before updating
    const ticketBefore = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!ticketBefore) {
      return {
        status: "ERROR",
        message: "Ticket não encontrado",
        fieldErrors: {},
        timestamp: Date.now(),
      } as ActionState;
    }

    // Update the ticket status
    const updatedTicket = await prisma.ticket.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    // When ticket is marked as CONCLUÍDO, we need to:
    // 1. Add a system comment to record who completed it
    // 2. Send email notifications
    if (status === "CONCLUÍDO") {
      // Create a system comment with a consistent format for tracking completion
      // Updated format for better readability and parsing
      const now = new Date();
      const formattedDate = now.toISOString();

      await prisma.comment.create({
        data: {
          content: `Ticket marcado como CONCLUÍDO pelo administrador: ${user.username} (${formattedDate})`,
          userId: user.id,
          ticketId: id,
        },
      });

      // Send email notifications if user email is available
      // Use 'after' to send emails in the background without blocking the response
      const ticketUserEmail = ticketBefore.user?.email;
      const ticketUserName = ticketBefore.user?.username;

      if (ticketUserEmail) {
        after(async () => {
          try {
            console.log(`Enviando email de notificação para: ${id}`);

            await sendTicketCompletedEmails(
              ticketUserEmail, // User email
              ticketUserName || "User", // User name
              user.email || "", // Admin email
              user.username, // Admin name
              ticketBefore.title, // Ticket title
              id, // Ticket ID
              ticketBefore.content, // Ticket content
              ticketBefore.filial // Branch/filial
            );

            console.log("Notificacao de conclusão enviada com sucesso");
          } catch (emailError) {
            // Log error but the status update is already done
            console.error("Falha ao enviar email de notificação:", emailError);
          }
        });
      }
    }

    revalidatePath(ticketsPath());

    return {
      status: "SUCCESS",
      message: `Status atualizado para ${status}`,
      fieldErrors: {},
      timestamp: Date.now(),
    } as ActionState;
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
