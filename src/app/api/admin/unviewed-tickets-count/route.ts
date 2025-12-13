import { NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { getUnviewedTicketsCount } from "@/features/ticket/queries/get-unviewed-tickets-count";

export async function GET() {
  try {
    const { user } = await getAuth();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await getUnviewedTicketsCount();

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching unviewed tickets count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

