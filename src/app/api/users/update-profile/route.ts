import { prisma } from "@/services/db/prisma";
import { getServerSession } from "@/features/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Define validation schema for profile update
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
  role: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to update your profile" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await req.json();

    // Validate the request body
    const validatedData = profileSchema.parse(body);

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: validatedData.name,
        companyName: validatedData.company,
        role: validatedData.role,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        companyName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
