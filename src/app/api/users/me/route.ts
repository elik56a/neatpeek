import { prisma } from "@/services/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get the current user's data
 */
export async function GET(req: NextRequest) {
  try {
    console.log("Fetching current user data...");

    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      console.log("No authenticated user found");
      return NextResponse.json(
        { error: "You must be logged in to view your profile" },
        { status: 401 }
      );
    }

    // Get the user with company data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        companyId: true,
        companyRole: true,
        figmaUserId: true, // Used only for determining connection status
        company: {
          select: {
            id: true,
            name: true,
            domain: true,
            logo: true,
          },
        },
      },
    });

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has Figma connection
    const hasFigmaConnection = Boolean(user.figmaUserId);

    // Create a new user object without sensitive Figma fields
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      companyId: user.companyId,
      companyRole: user.companyRole,
      company: user.company,
      hasFigmaConnection,
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}
