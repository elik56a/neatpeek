// src/app/api/campaign-briefs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/auth';
import { db } from '@/services/db/prisma';
import { Role, hasRole } from '@/features/auth/utils/rbac';
// Placeholder for file upload handling (e.g., to local disk or cloud storage)
// import { writeFile } from 'fs/promises'; // For local disk
// import path from 'path'; // For local disk

interface SessionUser { id: string; role?: Role; companyId?: string | null; }

// This is a simplified AI service call. Replace with actual implementation.
async function getAiRecommendations(briefData: any) {
  console.log("AI Service: Generating recommendations for brief:", briefData.objective);
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    summary: `This campaign aims to ${briefData.objective} by targeting ${briefData.audience} during the ${briefData.funnelStage} stage. Key CTAs: ${briefData.creativeConstraintsCTAs}.`,
    recommendations: {
      copy: ["Consider using emotional triggers.", "Highlight unique selling proposition X."],
      tone: ["Maintain a confident yet empathetic tone."],
      visuals: ["Use high-quality images that resonate with the target audience."]
    }
  };
}


export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user || !user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (!hasRole(user, [Role.MARKETER, Role.ADMIN])) {
    return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const jsonDataString = formData.get('jsonData') as string;
    const files = formData.getAll('files') as File[];

    if (!jsonDataString) {
      return NextResponse.json({ message: 'Missing brief data' }, { status: 400 });
    }
    const briefData = JSON.parse(jsonDataString);

    // TODO: File Upload Handling - This is a placeholder
    // In a real app, upload files to a designated storage (e.g., S3, GCS, or local 'public/uploads/campaign_content')
    // and store their URLs or paths.
    const uploadedFileDetails: { fileName: string; fileType: string; fileUrl: string; fileSize: number }[] = [];
    for (const file of files) {
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);
      // const filePath = path.join(process.cwd(), 'public', 'uploads', 'campaign_content', file.name);
      // await writeFile(filePath, buffer);
      // console.log(`Uploaded ${file.name} to ${filePath}`);
      uploadedFileDetails.push({
        fileName: file.name,
        fileType: file.type,
        fileUrl: `/uploads/campaign_content/${file.name}`, // Placeholder URL
        fileSize: file.size,
      });
    }
    console.log("Uploaded file details (placeholder):", uploadedFileDetails);


    const newCampaignBrief = await db.campaignBrief.create({
      data: {
        marketerId: user.id,
        companyId: user.companyId, // Assuming companyId is in session
        objective: briefData.objective,
        funnelStage: briefData.funnelStage,
        targetPlatforms: briefData.targetPlatforms,
        audience: briefData.audience,
        messagingPainPoints: briefData.messagingPainPoints,
        messagingTone: briefData.messagingTone,
        messagingGoals: briefData.messagingGoals,
        creativeConstraintsMustHaves: briefData.creativeConstraintsMustHaves,
        creativeConstraintsDonts: briefData.creativeConstraintsDonts,
        creativeConstraintsCTAs: briefData.creativeConstraintsCTAs,
        // generatedSummary and aiRecommendations will be updated after AI call
        content: {
          create: uploadedFileDetails.map(file => ({
            fileName: file.fileName,
            fileType: file.fileType,
            fileUrl: file.fileUrl, // Store the actual URL post-upload
            fileSize: file.fileSize,
          })),
        },
      },
      include: { content: true } // Include content to return it
    });

    // Asynchronous AI call - do not wait for it to respond to client for faster UX
    // In a real app, this might be offloaded to a background worker.
    getAiRecommendations(briefData)
      .then(async aiOutput => {
        await db.campaignBrief.update({
          where: { id: newCampaignBrief.id },
          data: {
            generatedSummary: aiOutput.summary,
            aiRecommendations: aiOutput.recommendations as any, // Prisma expects Json
          },
        });
        console.log(`AI recommendations updated for brief ${newCampaignBrief.id}`);
      })
      .catch(aiError => {
        console.error(`AI processing failed for brief ${newCampaignBrief.id}:`, aiError);
        // Optionally, store a status indicating AI processing failed
      });

    return NextResponse.json({ message: 'Campaign brief created successfully. AI processing initiated.', data: newCampaignBrief }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create campaign brief:', error);
    // Check if error is due to JSON parsing for better client feedback
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
        return NextResponse.json({ message: 'Invalid JSON data provided.', error: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
