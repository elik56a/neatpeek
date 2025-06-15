// src/app/api/onboarding/ad-platforms/sync/[platform]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/auth';
import { db } from '@/services/db/prisma'; // Assuming Prisma client

interface SessionUser { id: string; /* other properties */ }

export async function POST(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user || !user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const platformToSync = params.platform.toUpperCase();

  try {
    // 1. Verify that the user has an active connection for this platform
    const connection = await db.adPlatformConnection.findFirst({
      where: {
        userId: user.id,
        platformName: platformToSync,
        // Optionally, check if token is still valid or refresh if necessary
      },
    });

    if (!connection) {
      return NextResponse.json({ message: `No active connection found for ${platformToSync}. Please connect the platform first.` }, { status: 400 });
    }

    // 2. Log the request or add to a very simple queue (conceptual)
    // In a real application, this would trigger a background job (e.g., BullMQ, RabbitMQ, Cloud Tasks)
    console.log(`[Background Sync Triggered]: User ${user.id} requested sync for ${platformToSync}. Connection ID: ${connection.id}`);
    // Example: await db.backgroundJob.create({ data: { userId: user.id, platform: platformToSync, type: 'INITIAL_CAMPAIGN_SYNC' }});

    // 3. Respond to the client immediately
    return NextResponse.json({ message: `Background sync for ${platformToSync} has been initiated. Historical data will appear in your dashboard once processed.` }, { status: 202 });

  } catch (error: any) {
    console.error(`Error triggering sync for ${platformToSync} for user ${user.id}:`, error);
    return NextResponse.json({ message: 'Failed to initiate background sync.', error: error.message }, { status: 500 });
  }
}
