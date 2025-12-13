"use server";

import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";
import { revalidatePath } from "next/cache";
import { setCookieByKey } from "@/actions/cookies";
import { ticketPath, ticketsPath } from "@/paths";
import { redirect } from "next/navigation";

/**
 * Server action to create a ticket with proper handling of nullable fields
 * This is a simplified action that can be used independently without changing existing components
 */
export async function createSafeTicket(formData: FormData) {
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

    // Debug log
    console.log("Creating safe ticket with:");
    console.log("- title:", title);
    console.log("- content:", content);
    console.log(
      "- categoryIdRaw:",
      categoryIdRaw,
      "type:",
      typeof categoryIdRaw
    );
    console.log("- filialRaw:", filialRaw, "type:", typeof filialRaw);

    // CRITICAL FIX: Explicit handling of null values
    // Convert "null" string, empty strings, and falsy values to proper null
    const categoryId =
      categoryIdRaw === "null" || !categoryIdRaw ? null : String(categoryIdRaw);
    const filial =
      filialRaw === "null" || !filialRaw ? null : String(filialRaw);

    // Log processed values
    console.log("Processed values:");
    console.log("- categoryId:", categoryId, "type:", typeof categoryId);
    console.log("- filial:", filial, "type:", typeof filial);

    // Get today's date for deadline
    const today = new Date().toISOString().split("T")[0];

    // Check if categoryId exists if it's not null
    if (categoryId) {
      const category = await prisma.ticketCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        console.log("ERROR - Category not found with ID:", categoryId);
        return {
          success: false,
          error: `Category with ID ${categoryId} not found`,
        };
      }
    }

    // Create ticket with explicit null handling
    const ticket = await prisma.ticket.create({
      data: {
        title,
        content,
        userId: user.id,
        status: "ABERTO",
        deadline: today,
        categoryId, // Now properly handled as null if needed
        filial, // Now properly handled as null if needed
      },
    });

    console.log("SUCCESS - Ticket created with ID:", ticket.id);

    // Set success message
    await setCookieByKey("toast", "Ticket created successfully");

    // Revalidate tickets path
    revalidatePath(ticketsPath());

    // Redirect to new ticket page with new=true parameter
    redirect(`${ticketPath(ticket.id)}?new=true`);
  } catch (error) {
    console.error("ERROR - Failed to create ticket:", error);

    // For simplicity, just return error info without redirecting
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
