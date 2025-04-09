import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Define validation schema for notification settings
const notificationSchema = z.object({
  designChecksComplete: z.boolean().optional(),
  designChecksFailed: z.boolean().optional(),
  commentsOnDesigns: z.boolean().optional(),
  brandUpdates: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to update your notification settings" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const validatedData = notificationSchema.parse(body);
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update or create notification settings
    const settings = await prisma.notificationSettings.upsert({
      where: { userId: user.id },
      update: validatedData,
      create: {
        userId: user.id,
        ...validatedData,
      },
    });
    
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}
