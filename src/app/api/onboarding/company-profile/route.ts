// src/app/api/onboarding/company-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/auth'; // Ensure authOptions is correctly exported
import { db } from '@/services/db/prisma'; // Prisma client instance
import { Role, hasRole } from '@/features/auth/utils/rbac';

// Ensure this is defined if not already
interface SessionUser {
  id: string;
  role?: Role;
  companyId?: string | null;
  // Add other properties your session user might have
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user || !user.id || !user.companyId) {
    return NextResponse.json({ message: 'Unauthorized: User or company not identified' }, { status: 401 });
  }

  // Optional: Check if user has a role that allows modifying company profile (e.g., ADMIN or initial setup phase)
  // For now, we assume an authenticated user part of a company can set this up during onboarding.
  // if (!hasRole(user, [Role.ADMIN])) { // Example role check
  //   return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
  // }

  try {
    const body = await request.json();
    const { industry, personas, positioning, companyId: reqCompanyId } = body;

    if (reqCompanyId !== user.companyId) {
      return NextResponse.json({ message: 'Forbidden: Company ID mismatch' }, { status: 403 });
    }

    if (!industry || !personas || !positioning) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const companyProfile = await db.companyProfile.upsert({
      where: { companyId: user.companyId },
      update: { industry, personas, positioning },
      create: {
        companyId: user.companyId,
        industry,
        personas,
        positioning,
      },
    });

    return NextResponse.json({ message: 'Company profile saved successfully', data: companyProfile }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to save company profile:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user || !user.id || !user.companyId) {
    return NextResponse.json({ message: 'Unauthorized: User or company not identified' }, { status: 401 });
  }

  try {
    const companyProfile = await db.companyProfile.findUnique({
      where: { companyId: user.companyId },
    });

    if (!companyProfile) {
      return NextResponse.json({ message: 'Company profile not found' }, { status: 404 });
    }

    return NextResponse.json({ data: companyProfile }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to fetch company profile:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
