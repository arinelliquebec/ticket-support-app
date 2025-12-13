// src/app/api/tickets/[ticketId]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Prevent caching for real-time data

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Verify authentication
    const { user } = await getAuth();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId } = await params;

    // Get the ticket to check permissions
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Check if user has permission (admin or ticket owner)
    const isAdmin = user.role === "ADMIN";
    if (!isAdmin && ticket.userId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to view these comments" },
        { status: 403 }
      );
    }

    // Fetch comments for the ticket
    const comments = await prisma.comment.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
