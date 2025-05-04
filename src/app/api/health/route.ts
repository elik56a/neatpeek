import { NextResponse } from 'next/server';
import { apiLogger } from '@/services/logger';
import { HealthInfo, HealthError } from '@/features/health/types/health';

export async function GET() {
  try {
    apiLogger.info('Processing health check request', {
      module: 'health-api',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    // Get system information
    const healthInfo: HealthInfo = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external,
      },
    };

    apiLogger.info('Health check completed successfully', {
      module: 'health-api',
      metadata: healthInfo,
    });

    return NextResponse.json(healthInfo);
  } catch (error) {
    apiLogger.error('Health check failed', {
      module: 'health-api',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    });

    const healthError: HealthError = {
      status: 'unhealthy',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(healthError, { status: 500 });
  }
} 