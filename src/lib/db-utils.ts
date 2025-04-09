import { prisma } from './prisma';

// Using string literals for plan tiers as defined in the schema
type PlanTier = 'FREEMIUM' | 'PRO' | 'BUSINESS';

/**
 * Helper function to check if a user has exceeded their usage limit for a feature
 */
export async function checkUsageLimit(
  userId: string, 
  featureKey: string
): Promise<{
  allowed: boolean;
  currentUsage: number;
  limit: number;
}> {
  // Get the user's subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      plan: {
        include: {
          usageLimits: true,
        },
      },
    },
  });

  if (!subscription) {
    throw new Error('No active subscription found');
  }

  // Find the usage limit for this feature
  const usageLimit = subscription.plan.usageLimits.find(
    (limit) => limit.featureKey === featureKey
  );

  if (!usageLimit) {
    throw new Error(`No usage limit defined for feature: ${featureKey}`);
  }

  // If limit is -1, it means unlimited
  if (usageLimit.limit === -1) {
    return { allowed: true, currentUsage: 0, limit: -1 };
  }

  // Get current usage
  const now = new Date();
  let periodStart = new Date();

  // Set the period start date based on reset period
  switch (usageLimit.resetPeriod) {
    case 'DAILY':
      periodStart.setHours(0, 0, 0, 0);
      break;
    case 'WEEKLY':
      const dayOfWeek = now.getDay();
      periodStart.setDate(now.getDate() - dayOfWeek);
      periodStart.setHours(0, 0, 0, 0);
      break;
    case 'MONTHLY':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'YEARLY':
      periodStart = new Date(now.getFullYear(), 0, 1);
      break;
    case 'NEVER':
      // For cumulative limits that don't reset, we need to check all usage
      periodStart = new Date(0); // Start of epoch
      break;
  }

  // Get current usage count
  const usageCount = await prisma.usageCount.findUnique({
    where: {
      userId_featureKey_periodStart: {
        userId,
        featureKey,
        periodStart,
      },
    },
  });

  const currentUsage = usageCount?.count || 0;

  return {
    allowed: currentUsage < usageLimit.limit,
    currentUsage,
    limit: usageLimit.limit,
  };
}

/**
 * Increment usage count for a feature
 */
export async function incrementUsage(
  userId: string,
  featureKey: string,
  amount = 1
): Promise<void> {
  const now = new Date();
  let periodStart = new Date();
  let periodEnd = new Date();

  // Get the user's subscription to determine the reset period
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      plan: {
        include: {
          usageLimits: true,
        },
      },
    },
  });

  if (!subscription) {
    throw new Error('No active subscription found');
  }

  // Find the usage limit for this feature
  const usageLimit = subscription.plan.usageLimits.find(
    (limit) => limit.featureKey === featureKey
  );

  if (!usageLimit) {
    throw new Error(`No usage limit defined for feature: ${featureKey}`);
  }

  // Calculate period start and end based on reset period
  switch (usageLimit.resetPeriod) {
    case 'DAILY':
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 1);
      break;
    case 'WEEKLY':
      const dayOfWeek = now.getDay();
      periodStart.setDate(now.getDate() - dayOfWeek);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 7);
      break;
    case 'MONTHLY':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'YEARLY':
      periodStart = new Date(now.getFullYear(), 0, 1);
      periodEnd = new Date(now.getFullYear() + 1, 0, 0);
      break;
    case 'NEVER':
      // For cumulative limits that don't reset
      periodStart = new Date(0); // Start of epoch
      periodEnd = new Date(3000, 0, 1); // Far future
      break;
  }

  // Update or create the usage count
  await prisma.usageCount.upsert({
    where: {
      userId_featureKey_periodStart: {
        userId,
        featureKey,
        periodStart,
      },
    },
    update: {
      count: {
        increment: amount,
      },
      lastUpdated: now,
    },
    create: {
      userId,
      featureKey,
      count: amount,
      periodStart,
      periodEnd,
      lastUpdated: now,
    },
  });
}

/**
 * Get a user's subscription plan with tier information
 */
export async function getUserPlanTier(userId: string): Promise<PlanTier | null> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
    },
    include: {
      plan: true,
    },
  });

  return (subscription?.plan.tier as PlanTier) || null;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: {
  userId?: string;
  teamId?: string;
  entityType: string;
  entityId: string;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: data.userId,
      teamId: data.teamId,
      entityType: data.entityType,
      entityId: data.entityId,
      action: data.action,
      details: data.details ? data.details as any : undefined,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
} 