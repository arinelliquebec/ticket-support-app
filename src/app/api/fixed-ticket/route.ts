// src/app/api/fixed-ticket/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { user } = await getAuth();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get data from request body
    const data = await request.json();
    const { title, content, categoryId, filial } = data;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Log what we're about to do with explicit type information
    console.log("Fixed ticket API creating ticket with values:", {
      title,
      content,
      userId: user.id,
      categoryId: categoryId === null ? "NULL" : categoryId,
      categoryIdType: categoryId === null ? "null" : typeof categoryId,
      filial: filial === null ? "NULL" : filial,
      filialType: filial === null ? "null" : typeof filial,
    });

    // Use today as deadline
    const today = new Date().toISOString().split("T")[0];

    // Verify categoryId exists if it's not null
    if (categoryId !== null) {
      const category = await prisma.ticketCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: `Category with ID ${categoryId} not found`,
            debug: { providedCategoryId: categoryId },
          },
          { status: 400 }
        );
      }
    }

    // Create the ticket with proper null handling
    const ticket = await prisma.ticket.create({
      data: {
        title,
        content,
        userId: user.id,
        status: "ABERTO",
        deadline: today,
        categoryId: categoryId === null ? null : categoryId,
        filial: filial === null ? null : filial,
      },
    });

    console.log("Ticket created successfully:", ticket.id);

    return NextResponse.json({
      success: true,
      message: "Ticket created successfully",
      ticketId: ticket.id,
    });
  } catch (error) {
    console.error("Error in fixed ticket creation:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        details:
          error instanceof Error ? error.stack : "No stack trace available",
      },
      { status: 500 }
    );
  }
}
