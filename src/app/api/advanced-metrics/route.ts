import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/features/auth/queries/get-auth";
import { getAdvancedMetrics } from "@/features/ticket/queries/get-advanced-metrics";

// Restricted to specific email only
const ALLOWED_EMAIL = "arinpar@gmail.com";

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuth();

    // Check authentication
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has permission (restricted email only)
    if (user.email !== ALLOWED_EMAIL) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to access this resource" },
        { status: 403 }
      );
    }

    // Get time range from query params
    const searchParams = request.nextUrl.searchParams;
    const timeRange = (searchParams.get("range") || "30d") as
      | "7d"
      | "30d"
      | "90d"
      | "all";

    // Fetch metrics
    const metrics = await getAdvancedMetrics(timeRange);

    return NextResponse.json({
      success: true,
      data: metrics,
      timeRange,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching advanced metrics:", error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

