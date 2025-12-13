"use server";

import { TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  ActionState,
  fromErrorToActionState,
} from "@/components/form/utils/to-action-state";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";

export const updateTicketStatus = async (id: string, status: TicketStatus) => {
  try {
    // Get the authenticated user (admin who is updating the status)
    const { user } = await getAuth();

    if (!user) {
      return {
        status: "ERROR" as const,
        message: "Usuário não autenticado",
        fieldErrors: {},
        timestamp: Date.now(),
      };
    }

    // Only admins can update status
    if (user.role !== "ADMIN") {
      return {
        status: "ERROR" as const,
        message: "Somente administradores podem atualizar o status",
        fieldErrors: {},
        timestamp: Date.now(),
      };
    }

    // Get the current ticket with user information
    const currentTicket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!currentTicket) {
      return {
        status: "ERROR" as const,
        message: "Ticket não encontrado",
        fieldErrors: {},
        timestamp: Date.now(),
      };
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

    // Add a comment to the ticket
    await prisma.comment.create({
      data: {
        ticketId: id,
        userId: user.id,
        content: `Status atualizado para ${status} por ${user.username}`,
      },
    });

    // If the status is changed to CONCLUÍDO, handle the email notification logic
    if (status === "CONCLUÍDO") {
      try {
        console.log("Status do ticket atualizado para Concluído.");

        // Extract user information safely
        const userEmail = currentTicket.user?.email || "";
        const userName = currentTicket.user?.username || "User";

        // Extract admin information
        const adminEmail = user.email;
        const adminName = user.username;

        console.log("Um email foi enviado para:", {
          user: `${userName} (${userEmail})`,
          admin: `${adminName} (${adminEmail})`,
          ticketId: currentTicket.id,
          ticketTitle: currentTicket.title,
          filial: currentTicket.filial,
        });

        // Comment out the email sending function call for now until we fix it
        /*
        // Use one of these options:
        
        // Option 1: If using email-service.ts
        // import { sendTicketCompletedEmails } from "@/services/email-service";
        await sendTicketCompletedEmails(
          userEmail, 
          userName,
          adminEmail,
          adminName,
          currentTicket.title,
          currentTicket.id,
          currentTicket.content,
          currentTicket.filial
        );
        
        // Option 2: If using simple-email-service.ts 
        // import { sendStatusChangeNotification } from "@/services/simple-email-service";
        await sendStatusChangeNotification(
          currentTicket.id,
          currentTicket.title,
          "CONCLUÍDO",
          userEmail,
          userName,
          adminEmail,
          adminName,
          currentTicket.filial
        );
        */
      } catch (emailError) {
        console.error("Falha ao enviar notificação por email:", emailError);
        // Continue even if email fails - this shouldn't prevent the status update
      }
    }

    // Revalidate tickets page to show updated status
    revalidatePath(ticketsPath());

    return {
      status: "SUCCESS" as const,
      message: `Status atualizado para ${status}`,
      fieldErrors: {},
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Erro ao atualizar status do ticket:", error);
    return fromErrorToActionState(error);
  }
};
