"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuth } from "@/features/auth/queries/get-auth";
import { isOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";
import { setCookieByKey } from "@/actions/cookies";
import { ticketSchema } from "@/validations/ticket-schema";

/**
 * Server action to handle ticket creation and updates with proper validation
 * Designed to work with React Hook Form's data structure
 */
export async function hookFormTicketAction(
  formData: z.infer<typeof ticketSchema> & { id?: string }
) {
  try {
    // Get authenticated user
    const { user } = await getAuth();
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Extract form values
    const { id, title, content, categoryId, filial } = formData;

    // Get today's date for deadline
    const today = new Date().toISOString().split("T")[0];

    // Handle ticket update
    if (id) {
      // Get the existing ticket
      const existingTicket = await prisma.ticket.findUnique({
        where: { id },
      });

      if (!existingTicket) {
        return {
          success: false,
          error: "Ticket not found",
        };
      }

      // Verify permissions
      const isAdmin = user.role === "ADMIN";
      if (!isAdmin && !isOwner(user, existingTicket)) {
        return {
          success: false,
          error: "You don't have permission to edit this ticket",
        };
      }

      // Update the ticket
      const ticket = await prisma.ticket.update({
        where: { id },
        data: {
          title,
          content,
          deadline: today,
          categoryId, // Will be null for "none" selection
          filial, // Will be null for "none" selection
        },
      });

      // Revalidate paths
      revalidatePath(ticketsPath());
      await setCookieByKey("toast", "Ticket updated successfully");

      return {
        success: true,
        message: "Ticket updated successfully",
        ticketId: ticket.id,
      };
    }
    // Handle ticket creation
    else {
      // Create the ticket
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

      // Revalidate paths
      revalidatePath(ticketsPath());
      await setCookieByKey("toast", "Ticket created successfully");

      return {
        success: true,
        message: "Ticket created successfully",
        ticketId: ticket.id,
      };
    }
  } catch (error) {
    console.error("Error in hookFormTicketAction:", error);

    // Handle specific errors
    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint failed")
    ) {
      return {
        success: false,
        error:
          "Invalid category selected. Please choose a valid category from the list.",
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
