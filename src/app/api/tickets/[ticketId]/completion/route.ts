// src/app/api/tickets/[ticketId]/completion/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/features/auth/queries/get-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Get the authenticated user
    const { user } = await getAuth();

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const { ticketId } = await params;

    // Verify the ticket exists
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return new NextResponse(JSON.stringify({ error: "Ticket not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Only admins or the ticket owner can see completion details
    if (user.role !== "ADMIN" && ticket.userId !== user.id) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // If the ticket isn't completed, return empty result
    if (ticket.status !== "CONCLUÍDO") {
      return NextResponse.json({
        success: true,
        isCompleted: false,
        message: "Ticket is not completed",
      });
    }

    // Find the completion comment
    // Pattern: "Ticket marcado como CONCLUÍDO pelo administrador: {username}"
    const completionComments = await prisma.comment.findMany({
      where: {
        ticketId,
        content: {
          contains: "CONCLUÍDO pelo administrador",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    });

    if (completionComments.length === 0) {
      return NextResponse.json({
        success: true,
        isCompleted: true,
        hasCompletionData: false,
        message: "Completion information not found",
      });
    }

    const completionComment = completionComments[0];

    // Extract admin name from comment
    const pattern =
      /marcado como CONCLUÍDO pelo administrador: (.+?)(?:\s\(|$)/;
    const match = completionComment.content.match(pattern);

    const adminName = match?.[1] || completionComment.user.username;

    return NextResponse.json({
      success: true,
      isCompleted: true,
      hasCompletionData: true,
      completion: {
        adminId: completionComment.user.id,
        adminName: adminName,
        completedAt: completionComment.createdAt,
        commentId: completionComment.id,
      },
    });
  } catch (error) {
    console.error("Error fetching ticket completion info:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
