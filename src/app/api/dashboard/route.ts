import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { dashboardService } from "@/features/dashboard/services/dashboard-service";
import { DashboardFilters, DatePeriod } from "@/features/dashboard/types";

/**
 * GET /api/dashboard
 *
 * Fetch comprehensive dashboard data for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);

    // Validate date period if provided
    const period = searchParams.get("period") as DatePeriod | null;
    if (period && !Object.values(DatePeriod).includes(period)) {
      return NextResponse.json({ success: false, message: "Invalid date period" }, { status: 400 });
    }

    // Build filters from query parameters
    const filters: DashboardFilters | undefined =
      period || searchParams.get("start") || searchParams.get("end")
        ? {
            dateRange: period
              ? dashboardService.getDateRangeFromPeriod(period)
              : {
                  start:
                    searchParams.get("start") ||
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                  end: searchParams.get("end") || new Date().toISOString(),
                  period: DatePeriod.THIRTY_DAYS,
                },
            designTypes: searchParams.get("designTypes")?.split(",").filter(Boolean),
            projects: searchParams.get("projects")?.split(",").filter(Boolean),
            brandGuidelines: searchParams.get("brandGuidelines")?.split(",").filter(Boolean),
          }
        : undefined;

    // Call service to get dashboard data
    const data = await dashboardService.getDashboardData(session.user.id, filters);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Invalid")) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}
