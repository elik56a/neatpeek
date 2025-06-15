// src/app/api/copywriting/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/auth';
import { db } from '@/services/db/prisma';
// import { Role, hasRole } from '@/features/auth/utils/rbac'; // If specific role needed

// Placeholder AI service call
async function generateCopyFromAI(brief: any, platform: string, brandRules: any, companyProfile: any) {
  console.log(`AI Service: Generating copy for brief '${brief.objective}' for platform '${platform}'`);
  console.log("Using brand rules:", !!brandRules);
  console.log("Using company profile:", !!companyProfile);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI processing

  // Example: Tailor copy based on platform
  let copyText = `Generated copy for ${brief.objective} on ${platform}. `;
  if (platform.includes("headline")) copyText += "Short & punchy!";
  if (platform.includes("post") || platform.includes("caption")) copyText += "Engaging content here. #CampaignHashtag";

  return [{ platform: platform, copy: copyText }];
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  // Add role check if necessary:
  // if (!hasRole(session.user as any, [Role.MARKETER, Role.ADMIN])) {
  //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  // }
  const userId = (session.user as any).id;
  const companyId = (session.user as any).companyId;


  try {
    const { briefId, platform } = await request.json();
    if (!briefId || !platform) {
      return NextResponse.json({ message: 'Missing briefId or platform' }, { status: 400 });
    }

    const brief = await db.campaignBrief.findUnique({ where: { id: briefId, marketerId: userId } }); // Ensure user owns brief or has access
    if (!brief) {
      return NextResponse.json({ message: 'Campaign brief not found or access denied' }, { status: 404 });
    }

    // Fetch brand guidelines (simplified - assumes one primary guideline for company or user)
    // This needs to be more robust: which guideline to use?
    const brandGuideline = companyId ? await db.brandGuideline.findFirst({ where: { companyId }}) : null;
    const companyProfile = companyId ? await db.companyProfile.findFirst({ where: { companyId }}) : null;


    const copies = await generateCopyFromAI(brief, platform, brandGuideline?.brandRules, companyProfile);
    return NextResponse.json({ copies });

  } catch (error: any) {
    console.error('Failed to generate copy:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
