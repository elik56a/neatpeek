import { comparePasswords } from "@/features/auth/server/auth-utils";
import { prisma } from "@/services/db/prisma";
import { NextRequest, NextResponse } from "next/server";

// This is a server-side API route that verifies user credentials
// It's used by the client-side auth provider to avoid bundling bcrypt
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Update lastLogin time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return NextResponse.json(
      { message: "An error occurred while verifying credentials" },
      { status: 500 }
    );
  }
}
