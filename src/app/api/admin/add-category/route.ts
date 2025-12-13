// src/app/api/admin/add-category/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";

export async function GET(request: NextRequest) {
  try {
    // Verify if user is authenticated and is admin
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Check if Internet category already exists
    const existing = await prisma.ticketCategory.findFirst({
      where: {
        name: {
          equals: "Internet",
          mode: "insensitive", // Case insensitive check
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: `Internet category already exists with ID: ${existing.id}`,
        category: existing,
      });
    }

    // Create the Internet category
    const newCategory = await prisma.ticketCategory.create({
      data: {
        name: "Internet",
        color: "#8B5CF6", // Purple color
        description: "Internet connection issues",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Created Internet category with ID: ${newCategory.id}`,
      category: newCategory,
    });
  } catch (error) {
    console.error("Error adding Internet category:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
