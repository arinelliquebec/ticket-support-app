// src/app/api/direct-ticket/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { user } = await getAuth();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get basic data from request body
    const data = await request.json();
    const { title, content } = data;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Log what we're about to do
    console.log("Direct ticket API attempting to create ticket:", {
      title,
      content,
      userId: user.id,
      categoryId: null, // Explicitly using null
    });

    // Add today as deadline
    const today = new Date().toISOString().split("T")[0];

    // Try to create the ticket directly
    const ticket = await prisma.ticket.create({
      data: {
        title,
        content,
        userId: user.id,
        status: "ABERTO",
        deadline: today,
        categoryId: null, // Explicitly null
        filial: null, // Explicitly null
      },
    });

    console.log("Direct ticket created successfully:", ticket.id);

    return NextResponse.json({
      success: true,
      message: "Ticket created successfully",
      ticketId: ticket.id,
    });
  } catch (error) {
    console.error("Error in direct ticket creation:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorDetails: JSON.stringify(error, null, 2),
      },
      { status: 500 }
    );
  }
}
