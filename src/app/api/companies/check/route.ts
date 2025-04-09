import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Store a map of user IDs to timestamps to prevent excessive API calls
const userChecks = new Map<string, number>();

// Only allow one check per user every 5 seconds
const THROTTLE_TIME = 5000; // 5 seconds

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Check if this user has made a request recently
    const lastCheck = userChecks.get(userId);
    const now = Date.now();

    if (lastCheck && now - lastCheck < THROTTLE_TIME) {
      return NextResponse.json({ throttled: true }, { status: 429 });
    }

    // Update the last check time
    userChecks.set(userId, now);

    // Check if the user has any companies
    const companies = await prisma.company.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      take: 1, // We only need to know if there's at least one
    });

    return NextResponse.json({
      hasCompany: companies.length > 0,
      companyId: companies[0]?.id || null,
    });
  } catch (error) {
    console.error("Error checking companies:", error);
    return NextResponse.json({ error: "Failed to check companies" }, { status: 500 });
  }
}
