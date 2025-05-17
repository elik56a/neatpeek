import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { DesignsReviewsListService } from "@/features/designs-reviews-list/services/designs-reviews-list-service";
import { DesignsReviewSortField } from "@/features/designs-reviews-list/types/enums";
import { ReviewStatus } from "@/features/design-review/types";
import { SortDirection } from "@/types/enums";
import { prisma } from "@/services/db/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view designs reviews" },
        { status: 401 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const take = parseInt(searchParams.get("take") || "10");
    const status = (searchParams.get("status") as ReviewStatus) || undefined;
    const searchQuery = searchParams.get("searchQuery") || undefined;
    const sortField = (searchParams.get("sortField") ||
      DesignsReviewSortField.CREATED_AT) as DesignsReviewSortField;
    const sortDirection = (searchParams.get("sortDirection") ||
      SortDirection.DESC) as SortDirection;

    // Get the service instance
    const service = DesignsReviewsListService.getInstance();

    // Get paginated designs reviews
    const result = await service.getDesignsReviews({
      cursor,
      take,
      userId: user.id,
      status,
      searchQuery,
      orderBy: {
        field: sortField,
        direction: sortDirection,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching designs reviews:", error);
    return NextResponse.json({ error: "Failed to fetch designs reviews" }, { status: 500 });
  }
}
