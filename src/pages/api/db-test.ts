import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test basic connection
    const dbInfo = await prisma.$queryRaw`SELECT current_database() as db_name, current_user as user_name`;
    
    // Check for plans
    const plans = await prisma.plan.findMany({
      select: {
        id: true,
        name: true,
        tier: true,
      },
    });
    
    return res.status(200).json({
      success: true,
      message: 'Database connection successful',
      dbInfo,
      plans,
      connectionString: {
        // Only show part of the connection string for security
        format: process.env.DATABASE_URL?.substring(0, 35) + '...',
        includesSSL: process.env.DATABASE_URL?.includes('sslmode=require'),
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
      },
      connectionString: {
        // Only show part of the connection string for security
        format: process.env.DATABASE_URL?.substring(0, 35) + '...',
        includesSSL: process.env.DATABASE_URL?.includes('sslmode=require'),
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
