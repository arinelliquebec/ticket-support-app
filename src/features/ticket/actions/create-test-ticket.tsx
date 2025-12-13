"use server";

import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";

export async function createTestTicket(formData: FormData) {
  try {
    // Get the authenticated user
    const { user } = await getAuth();

    if (!user) {
      return {
        success: false,
        error: "No authenticated user found. Please login first.",
      };
    }

    // Log the user information
    console.log("Test Ticket Creation - Auth User:", {
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Get form values
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const categoryIdRaw = formData.get("categoryId") as string;
    const categoryIdType = formData.get("categoryIdType") as string;

    // Determine what to use for categoryId based on the type
    let categoryId: string | null = null;

    if (categoryIdType === "validId") {
      categoryId = categoryIdRaw;
    } else if (categoryIdType === "emptyString") {
      categoryId = ""; // Empty string
    } else if (categoryIdType === "null") {
      categoryId = null; // Explicit null
    }

    // Log what we're using
    console.log("Test Ticket Creation - Using values:", {
      title,
      content,
      userId: user.id,
      categoryId,
      categoryIdType,
    });

    // Add the current date as deadline
    const today = new Date().toISOString().split("T")[0];

    // Try to create the ticket
    try {
      const ticket = await prisma.ticket.create({
        data: {
          title,
          content,
          userId: user.id,
          status: "ABERTO",
          deadline: today,
          categoryId: categoryId,
        },
      });

      console.log("Ticket created successfully:", ticket.id);

      return {
        success: true,
        message: "Ticket created successfully",
        ticketId: ticket.id,
        data: ticket,
      };
    } catch (error) {
      console.error("Prisma error creating ticket:", error);

      // Get database schema information
      try {
        const ticketSchema = await prisma.$queryRaw`
          SELECT column_name, is_nullable, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'Ticket'
        `;

        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          schema: ticketSchema,
        };
      } catch (schemaError) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          schemaError: "Failed to get schema information",
        };
      }
    }
  } catch (error) {
    console.error("Overall error in test ticket creation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
