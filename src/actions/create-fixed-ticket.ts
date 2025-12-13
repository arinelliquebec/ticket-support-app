"use server";

import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";
import { revalidatePath } from "next/cache";
import { ticketsPath } from "@/paths";

/**
 * Server action to create a ticket with proper handling of nullable fields
 */
export async function createFixedTicket(formData: FormData) {
  try {
    // Get authenticated user
    const { user } = await getAuth();
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Extract form data
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const categoryIdRaw = formData.get("categoryId");
    const filialRaw = formData.get("filial");

    // CRITICAL FIX: Explicit handling of null values
    // Convert "null" string, empty strings, and falsy values to proper null
    const categoryId =
      categoryIdRaw === "null" || !categoryIdRaw ? null : String(categoryIdRaw);
    const filial =
      filialRaw === "null" || !filialRaw ? null : String(filialRaw);

    // Get today's date for deadline
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

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        title,
        content,
        userId: user.id,
        status: "ABERTO",
        deadline: today,
        categoryId, // This should now be a proper null or valid ID
        filial, // This should now be a proper null or valid string
      },
    });

    // Revalidate tickets path to show the new ticket
    revalidatePath(ticketsPath());

    return {
      success: true,
      message: "Ticket created successfully",
      ticketId: ticket.id,
      data: ticket,
    };
  } catch (error) {
    console.error("ERROR - Failed to create ticket:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorDetails: error,
    };
  }
}
