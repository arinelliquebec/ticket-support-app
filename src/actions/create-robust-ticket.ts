"use server";

import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";
import { revalidatePath } from "next/cache";
import { setCookieByKey } from "@/actions/cookies";
import { ticketPath, ticketsPath } from "@/paths";
import { redirect } from "next/navigation";
import { eventBus } from "@/lib/realtime/event-bus";

/**
 * Robust ticket creation action that properly handles all edge cases
 * Including null values for optional fields like categoryId and filial
 */
export async function createRobustTicket(formData: FormData) {
  try {
    // Get authenticated user
    const { user } = await getAuth();
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Extract form data with detailed logging
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const categoryIdRaw = formData.get("categoryId");
    const filialRaw = formData.get("filial");
    const priorityRaw = formData.get("priority") as string;

    // Validate required fields
    if (!title || !content) {
      return {
        success: false,
        error: "Title and content are required",
      };
    }

    console.log("Creating ticket with values:");
    console.log("- title:", title);
    console.log("- content:", content);
    console.log(
      "- categoryIdRaw:",
      categoryIdRaw,
      "type:",
      typeof categoryIdRaw
    );
    console.log("- filialRaw:", filialRaw, "type:", typeof filialRaw);
    console.log("- priorityRaw:", priorityRaw, "type:", typeof priorityRaw);

    // CRITICAL FIX: Proper handling of null/empty values
    // Convert "null" string, empty strings, and falsy values to proper null
    const categoryId =
      categoryIdRaw === "null" || categoryIdRaw === "" || !categoryIdRaw
        ? null
        : String(categoryIdRaw);

    const filial =
      filialRaw === "null" || filialRaw === "" || !filialRaw
        ? null
        : String(filialRaw);

    // Validate and set priority (default to MEDIA if not provided or invalid)
    const validPriorities = ["BAIXA", "MEDIA", "ALTA", "URGENTE"];
    const priority = validPriorities.includes(priorityRaw)
      ? priorityRaw
      : "MEDIA";

    // Log processed values
    console.log("Processed values:");
    console.log("- categoryId:", categoryId, "type:", typeof categoryId);
    console.log("- filial:", filial, "type:", typeof filial);
    console.log("- priority:", priority, "type:", typeof priority);

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

      console.log("Category found:", category.name);
    }

    // Create the ticket with safe values
    console.log("Creating ticket with processed values");
    const ticket = await prisma.ticket.create({
      data: {
        title,
        content,
        userId: user.id,
        status: "ABERTO",
        priority: priority as any, // Cast to any to avoid type issues
        deadline: today,
        categoryId, // Will be null for "none" selection
        filial, // Will be null for "none" selection
      },
    });

    console.log("SUCCESS - Ticket created with ID:", ticket.id);
    console.log("PRIORITY:", ticket.priority);
    console.log("USER:", user.username);

    // Broadcast real-time event to admins
    console.log(
      "[Ticket Creation] ========== Broadcasting ticket:created event =========="
    );
    console.log("[Ticket Creation] Event data:", {
      ticketId: ticket.id,
      title: ticket.title,
      priority: ticket.priority,
      user: user.username,
    });

    eventBus.broadcast({
      type: "ticket:created",
      adminOnly: true,
      data: {
        ticketId: ticket.id,
        ticket: {
          id: ticket.id,
          title: ticket.title,
          priority: ticket.priority,
          status: ticket.status,
          createdAt: ticket.createdAt,
          user: {
            username: user.username,
          },
        },
      },
      timestamp: Date.now(),
    });

    console.log("[Ticket Creation] ========== Broadcast completed ==========");

    // Broadcast KPI update for real-time dashboard
    console.log("[Ticket Creation] Broadcasting kpi:ticket_created event...");
    eventBus.broadcast({
      type: "kpi:ticket_created",
      adminOnly: true,
      data: {
        ticketId: ticket.id,
        title: ticket.title,
        priority: ticket.priority,
        user: user.username,
      },
      timestamp: Date.now(),
    });

    // Revalidate paths
    revalidatePath(ticketsPath());

    // Set a success message for after redirection
    await setCookieByKey("toast", "Ticket created successfully");

    // Return success with complete ticket data
    return {
      success: true,
      message: "Ticket created successfully",
      ticketId: ticket.id,
      data: ticket, // Include the full ticket data
    };
  } catch (error) {
    console.error("ERROR - Failed to create ticket:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      errorDetails: error,
    };
  }
}

/**
 * Wrapper function that can be used with a form action and handles redirection
 */
export async function createTicketWithRedirect(formData: FormData) {
  const result = await createRobustTicket(formData);

  if (result.success && result.ticketId) {
    // Redirect to the new ticket page with new=true parameter
    redirect(`${ticketPath(result.ticketId)}?new=true`);
  }

  return result;
}
