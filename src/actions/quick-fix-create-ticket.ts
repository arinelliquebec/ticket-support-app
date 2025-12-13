"use server";

import { revalidatePath } from "next/cache";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";
import { redirect } from "next/navigation";

/**
 * Fixed ticket creation action for handling foreign key constraints
 */
export async function quickFixCreateTicket(formData: FormData) {
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
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const categoryIdRaw = formData.get("categoryId");
    const filialRaw = formData.get("filial");

    // Validate mandatory fields
    if (!title || !content) {
      return {
        success: false,
        error: "Title and content are required",
      };
    }

    // VALIDATION: Make sure categoryId and filial are provided
    if (
      !categoryIdRaw ||
      categoryIdRaw === "none" ||
      categoryIdRaw === "null"
    ) {
      return {
        success: false,
        error: "Category is required",
      };
    }

    if (!filialRaw || filialRaw === "none" || filialRaw === "null") {
      return {
        success: false,
        error: "Filial is required",
      };
    }

    // Convert to strings
    const categoryId = String(categoryIdRaw);
    const filial = String(filialRaw);

    // VERIFICATION: Check if the category actually exists
    const category = await prisma.ticketCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return {
        success: false,
        error: `Category with ID ${categoryId} not found. Please select a valid category.`,
      };
    }

    // Get today's date for deadline
    const today = new Date().toISOString().split("T")[0];

    // Create the ticket with known good values
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

    console.log("Ticket created successfully:", ticket.id);

    // Revalidate tickets path and redirect
    revalidatePath(ticketsPath());

    return {
      success: true,
      message: "Ticket created successfully",
      ticketId: ticket.id,
    };
  } catch (error) {
    console.error("ERROR - Failed to create ticket:", error);

    // Extract specific error messages for more helpful feedback
    let errorMessage = "Unknown error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;

      // More specific foreign key error handling
      if (errorMessage.includes("Foreign key constraint failed")) {
        errorMessage =
          "Invalid category selected. Please choose a category that exists in the system.";
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
