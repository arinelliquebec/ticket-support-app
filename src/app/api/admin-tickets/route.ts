import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";

export const dynamic = "force-dynamic"; // Prevent caching for real-time data

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const { user } = await getAuth();

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (user.role !== "ADMIN") {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Get URL parameters for filtering
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");
    const filial = searchParams.get("filial"); // Add filial parameter

    // Build query filters
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Add filial filter if provided
    if (filial) {
      where.filial = filial;
    }

    // Fetch tickets with related data
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true, // Include email in the selection
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching admin tickets:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch tickets" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
