import { NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { markAllTicketsAsViewed } from "@/features/ticket/actions/mark-ticket-viewed";

export async function POST() {
  try {
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await markAllTicketsAsViewed();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      count: result.count,
    });
  } catch (error) {
    console.error("Error marking all tickets as viewed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

