import { hashPassword } from "@/features/auth/server/auth-utils";
import { prisma } from "@/services/db/prisma";
import { CompanyRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Check if the email domain matches any existing company
    const emailDomain = email.split("@")[1];
    let companyId = null;
    let companyRole = CompanyRole.MEMBER;

    if (emailDomain) {
      // Look for a company with this domain
      const company = await prisma.company.findUnique({
        where: { domain: emailDomain },
      });

      if (company) {
        companyId = company.id;
      }
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: true,
        companyId,
        companyRole,
        subscriptions: {
          create: {
            planId: "plan_freemium", // Assign freemium plan by default
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
        },
      },
      include: {
        company: true,
      },
    });

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;

    // Return a more detailed response to help with debugging
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userWithoutPassword,
        loginUrl: "/api/auth/signin?callbackUrl=/dashboard",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred during registration" }, { status: 500 });
  }
}
