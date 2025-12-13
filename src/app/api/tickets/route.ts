import { NextRequest, NextResponse } from "next/server";
import { getTickets } from "@/features/ticket/queries/get-tickets";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "0");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const filial = searchParams.get("filial") || undefined;
    const sortBy = searchParams.get("sortBy") || undefined;
    const sortOrder = searchParams.get("sortOrder") || undefined;

    const result = await getTickets({
      page,
      size: pageSize,
      search,
      status,
      categoryId,
      dateFrom,
      dateTo,
      filial,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      tickets: result.list,
      hasMore: result.metadata.hasNextPage,
      total: result.metadata.count,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
