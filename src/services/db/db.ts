import { prisma } from './prisma';

/**
 * Generic database operations that can be used across the application
 */

// User operations
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(data: {
  email: string;
  name?: string;
  password?: string;
}) {
  return prisma.user.create({
    data,
  });
}

// Brand operations
export async function getBrandsByUserId(userId: string) {
  return prisma.brand.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getBrandsByTeamId(teamId: string) {
  return prisma.brand.findMany({
    where: { teamId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getBrandById(id: string) {
  return prisma.brand.findUnique({
    where: { id },
    include: {
      brandFiles: true,
      designExamples: true,
    },
  });
}

export async function createBrand(data: {
  name: string;
  description?: string;
  userId: string;
  teamId?: string;
  brandRules: any;
}) {
  return prisma.brand.create({
    data,
  });
}

// Project operations
export async function getProjectsByBrandId(brandId: string) {
  return prisma.project.findMany({
    where: { brandId },
    orderBy: { updatedAt: 'desc' },
  });
}


// Team operations
export async function getUserTeams(userId: string) {
  return prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: true,
    },
  });
}

export async function getTeamById(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

// Subscription operations
export async function getUserSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId },
    include: {
      plan: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTeamSubscription(teamId: string) {
  return prisma.subscription.findUnique({
    where: { teamId },
    include: {
      plan: true,
    },
  });
}

// Usage tracking
export async function trackUsage(data: {
  userId?: string;
  teamId?: string;
  featureKey: string;
  count: number;
}) {
  const { userId, teamId, featureKey, count } = data;
  
  if (!userId && !teamId) {
    throw new Error('Either userId or teamId must be provided');
  }
  
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
  
  const where = userId
    ? { userId, featureKey, periodStart }
    : { teamId, featureKey, periodStart };
  
  // Try to update existing record
  const existingCount = await prisma.usageCount.findFirst({
    where: where as any,
  });
  
  if (existingCount) {
    return prisma.usageCount.update({
      where: { id: existingCount.id },
      data: {
        count: existingCount.count + count,
        lastUpdated: now,
      },
    });
  }
  
  // Create new record if none exists
  return prisma.usageCount.create({
    data: {
      userId,
      teamId,
      featureKey,
      count,
      periodStart,
      periodEnd,
      lastUpdated: now,
    },
  });
}

// Check if user/team has exceeded usage limits
export async function checkUsageLimit(data: {
  userId?: string;
  teamId?: string;
  featureKey: string;
}): Promise<{ hasLimit: boolean; limit: number; currentUsage: number; exceeded: boolean }> {
  const { userId, teamId, featureKey } = data;
  
  if (!userId && !teamId) {
    throw new Error('Either userId or teamId must be provided');
  }
  
  // Get the plan for the user or team
  let planId;
  
  if (userId) {
    const subscription = await getUserSubscription(userId);
    planId = subscription?.planId;
  } else if (teamId) {
    const subscription = await getTeamSubscription(teamId);
    planId = subscription?.planId;
  }
  
  if (!planId) {
    // Default to freemium plan limits if no subscription
    const freemiumPlan = await prisma.plan.findFirst({
      where: { tier: 'FREEMIUM' },
    });
    planId = freemiumPlan?.id;
  }
  
  // Get the limit for this feature
  const limit = await prisma.usageLimit.findUnique({
    where: {
      planId_featureKey: {
        planId,
        featureKey,
      },
    },
  });
  
  if (!limit || limit.limit === -1) {
    // No limit or unlimited
    return { hasLimit: false, limit: -1, currentUsage: 0, exceeded: false };
  }
  
  // Get current usage
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
  
  const where = userId
    ? { userId, featureKey, periodStart }
    : { teamId, featureKey, periodStart };
  
  const usage = await prisma.usageCount.findFirst({
    where: where as any,
  });
  
  const currentUsage = usage?.count || 0;
  const exceeded = currentUsage >= limit.limit;
  
  return {
    hasLimit: true,
    limit: limit.limit,
    currentUsage,
    exceeded,
  };
}
