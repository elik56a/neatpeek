import { prisma } from "@/services/db/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const rateLimitKey = `login:${email}`;

    // Check rate limiting
    const rateLimit = await prisma.rateLimit.findUnique({
      where: { key: rateLimitKey },
    });

    if (rateLimit && rateLimit.count >= 5) {
      const timeSinceLastAttempt = Date.now() - rateLimit.updatedAt.getTime();
      const fifteenMinutes = 15 * 60 * 1000;

      if (timeSinceLastAttempt < fifteenMinutes) {
        return NextResponse.json(
          { success: false, error: "Too many login attempts. Please try again later." },
          { status: 429 }
        );
      } else {
        // Reset rate limit if time window has passed
        await prisma.rateLimit.update({
          where: { key: rateLimitKey },
          data: { count: 0 },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { email, success } = await request.json();
    const rateLimitKey = `login:${email}`;

    if (success) {
      // Reset rate limit on successful login
      await prisma.rateLimit.upsert({
        where: { key: rateLimitKey },
        update: { count: 0 },
        create: { key: rateLimitKey, count: 0 },
      });
    } else {
      // Increment rate limit on failed attempt
      await prisma.rateLimit.upsert({
        where: { key: rateLimitKey },
        update: {
          count: { increment: 1 },
        },
        create: {
          key: rateLimitKey,
          count: 1,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Rate limit update failed:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
