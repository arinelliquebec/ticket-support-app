import { NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { getUnviewedTickets } from "@/features/ticket/queries/get-unviewed-tickets-count";

export async function GET() {
  try {
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await getUnviewedTickets(20); // Get up to 20 tickets

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching unviewed tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

