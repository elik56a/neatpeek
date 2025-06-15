// src/app/api/copywriting/brainstorm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/auth';
import { db } from '@/services/db/prisma';

// Placeholder AI service call for chat
async function getChatReplyFromAI(message: string, history: any[], briefContext: any, brandRules: any) {
  console.log(`AI Service: Brainstorming for brief '${briefContext.objective}'. User message: '${message}'`);
  console.log("Using brand rules:", !!brandRules);
  console.log("Recent history length:", history.length);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate AI processing
  return `AI reply to "${message}". Considering the objective: ${briefContext.objective}.`;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
   if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const companyId = (session.user as any).companyId;

  try {
    const { briefId, message, history = [] } = await request.json();
    if (!briefId || !message) {
      return NextResponse.json({ message: 'Missing briefId or message' }, { status: 400 });
    }

    const brief = await db.campaignBrief.findUnique({ where: { id: briefId, marketerId: userId } });
    if (!brief) {
      return NextResponse.json({ message: 'Campaign brief not found or access denied' }, { status: 404 });
    }

    const brandGuideline = companyId ? await db.brandGuideline.findFirst({ where: { companyId }}) : null;

    const reply = await getChatReplyFromAI(message, history, brief, brandGuideline?.brandRules);
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Error in brainstorming chat:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
