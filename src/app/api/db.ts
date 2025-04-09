import { prisma } from '@/lib/prisma';

// Export the prisma instance for use in API routes
export { prisma };

// Re-export utility functions
    export * from '@/lib/db';
