import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { markTicketAsViewed } from "@/features/ticket/actions/mark-ticket-viewed";

export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: "ticketId is required" },
        { status: 400 }
      );
    }

    const result = await markTicketAsViewed(ticketId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Error marking ticket as viewed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

