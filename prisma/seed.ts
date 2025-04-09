import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// Using string literals for plan tiers as defined in the schema
type PlanTier = 'FREEMIUM' | 'PRO' | 'BUSINESS';
const PlanTier = {
  FREEMIUM: 'FREEMIUM' as PlanTier,
  PRO: 'PRO' as PlanTier,
  BUSINESS: 'BUSINESS' as PlanTier
};

async function main() {
  console.log('Start seeding...');
  
  // Create subscription plans
  const freemiumPlan = await prisma.plan.upsert({
    where: { id: 'plan_freemium' },
    update: {},
    create: {
      id: 'plan_freemium',
      name: 'Freemium',
      tier: PlanTier.FREEMIUM,
      monthlyPrice: 0,
      currency: 'usd',
      features: JSON.stringify({
        brandCount: 1,
        frameAnalysis: true,
        aiSuggestions: true,
        historyRetention: '30 days',
      }),
      usageLimits: {
        create: [
          {
            featureKey: 'brands_count',
            limit: 1,
            resetPeriod: 'NEVER',
          },
          {
            featureKey: 'frames_per_month',
            limit: 20,
            resetPeriod: 'MONTHLY',
          },
          {
            featureKey: 'projects_per_brand',
            limit: 3,
            resetPeriod: 'NEVER',
          },
        ],
      },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: 'plan_pro' },
    update: {},
    create: {
      id: 'plan_pro',
      name: 'Pro',
      tier: PlanTier.PRO,
      monthlyPrice: 1999, // $19.99
      annualPrice: 19990, // $199.90 (2 months free)
      stripePriceId: 'price_pro_monthly',
      currency: 'usd',
      features: JSON.stringify({
        brandCount: 3,
        frameAnalysis: true,
        aiSuggestions: true,
        teamAccess: true,
        exportReports: true,
        historyRetention: '90 days',
      }),
      usageLimits: {
        create: [
          {
            featureKey: 'brands_count',
            limit: 3,
            resetPeriod: 'NEVER',
          },
          {
            featureKey: 'frames_per_month',
            limit: 100,
            resetPeriod: 'MONTHLY',
          },
          {
            featureKey: 'projects_per_brand',
            limit: 10,
            resetPeriod: 'NEVER',
          },
          {
            featureKey: 'team_members',
            limit: 5,
            resetPeriod: 'NEVER',
          },
        ],
      },
    },
  });

  const businessPlan = await prisma.plan.upsert({
    where: { id: 'plan_business' },
    update: {},
    create: {
      id: 'plan_business',
      name: 'Business',
      tier: PlanTier.BUSINESS,
      monthlyPrice: 4999, // $49.99
      annualPrice: 49990, // $499.90 (2 months free)
      stripePriceId: 'price_business_monthly',
      currency: 'usd',
      features: JSON.stringify({
        brandCount: -1, // Unlimited
        frameAnalysis: true,
        aiSuggestions: true,
        teamAccess: true,
        exportReports: true,
        customBranding: true,
        apiAccess: true,
        prioritySupport: true,
        historyRetention: '365 days',
      }),
      usageLimits: {
        create: [
          {
            featureKey: 'brands_count',
            limit: -1, // Unlimited
            resetPeriod: 'NEVER',
          },
          {
            featureKey: 'frames_per_month',
            limit: 500,
            resetPeriod: 'MONTHLY',
          },
          {
            featureKey: 'projects_per_brand',
            limit: -1, // Unlimited
            resetPeriod: 'NEVER',
          },
          {
            featureKey: 'team_members',
            limit: 20,
            resetPeriod: 'NEVER',
          },
        ],
      },
    },
  });

  // Create test users
  const hashedPassword = await hash('password123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      subscriptions: {
        create: {
          planId: freemiumPlan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'pro@example.com' },
    update: {},
    create: {
      email: 'pro@example.com',
      name: 'Pro User',
      password: hashedPassword,
      subscriptions: {
        create: {
          planId: proPlan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      },
    },
  });

  // Create team
  const team = await prisma.team.upsert({
    where: { id: 'team_business' },
    update: {},
    create: {
      id: 'team_business',
      name: 'Acme Design Team',
      ownerId: user2.id,
      subscription: {
        create: {
          userId: user2.id,
          planId: businessPlan.id,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      },
      members: {
        create: {
          userId: user2.id,
          role: 'OWNER',
        },
      },
    },
  });

  // Create brand for freemium user
  const brandFreemium = await prisma.brand.create({
    data: {
      name: 'Personal Brand',
      description: 'My personal design system',
      userId: user1.id,
      brandRules: JSON.stringify({
        colors: {
          primary: '#3498db',
          secondary: '#2ecc71',
          text: '#2c3e50',
          background: '#f9f9f9',
        },
        typography: {
          headingFont: 'Montserrat',
          bodyFont: 'Open Sans',
          baseFontSize: 16,
        },
        spacing: {
          baseUnit: 8,
        },
      }),
      brandFiles: {
        create: {
          fileName: 'Logo.png',
          fileType: 'LOGO',
          fileUrl: 'https://example.com/brand/logo.png',
          fileSize: 25600,
        },
      },
      designExamples: {
        create: {
          name: 'Home Screen',
          imageUrl: 'https://example.com/brand/example1.png',
          tags: ['homepage', 'landing'],
        },
      },
    },
  });

  // Create project and design reviews
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Redesigning the company website',
      brandId: brandFreemium.id,
    }
  });

  // Create Figma file
  const figmaFile = await prisma.figmaFile.create({
    data: {
      projectId: project.id,
      figmaFileKey: 'abcd1234efgh5678',
      figmaFileName: 'Website Design',
    }
  });

  // Create Figma frame
  const figmaFrame = await prisma.figmaFrame.create({
    data: {
      figmaFileId: figmaFile.id,
      frameId: 'frame123',
      name: 'Homepage',
      imageUrl: 'https://example.com/frames/homepage.png',
      screenType: 'desktop',
    }
  });

  // Create design review
  const designReview = await prisma.designReview.create({
    data: {
      frameId: figmaFrame.id,
      reviewJson: JSON.stringify({
        colorAnalysis: { score: 85, issues: [] },
        typographyAnalysis: { score: 90, issues: [] },
        accessibilityAnalysis: { score: 75, issues: [] },
      }),
      designScore: 85,
      brandComplianceScore: 88,
      visualHarmonyScore: 90,
      usabilityScore: 82,
      accessibilityScore: 75,
      status: 'COMPLETED',
    }
  });

  // Create comments
  await prisma.figmaComment.createMany({
    data: [
      {
        reviewId: designReview.id,
        frameId: figmaFrame.id,
        messageType: 'BRAND_ISSUE',
        message: 'The button color does not match the brand guidelines.',
        elementType: 'button',
        severity: 'MEDIUM',
        positionX: 0.7,
        positionY: 0.5,
      },
      {
        reviewId: designReview.id,
        frameId: figmaFrame.id,
        messageType: 'POSITIVE_ASPECT',
        message: 'Great use of typography hierarchy.',
        elementType: 'text',
        positionX: 0.3,
        positionY: 0.2,
      },
    ],
  });

  // Create a few feature flags
  await prisma.featureFlag.createMany({
    data: [
      {
        key: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'Enable advanced analytics features',
        isEnabled: false,
        enabledForTiers: [PlanTier.BUSINESS],
      },
      {
        key: 'ai_suggestions_v2',
        name: 'AI Suggestions V2',
        description: 'New version of AI suggestions with improved accuracy',
        isEnabled: true,
        enabledForTiers: [PlanTier.PRO, PlanTier.BUSINESS],
      },
    ],
  });
  
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 