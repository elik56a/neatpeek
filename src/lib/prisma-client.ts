import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a mock Prisma client for environments without a database
class MockPrismaClient {
  constructor() {
    return new Proxy(
      {},
      {
        get: (target, prop) => {
          // Return a mock function for any method call
          if (typeof prop === "string") {
            return () => {
              console.warn(
                `Prisma method ${String(prop)} called in an environment without a database connection`
              );
              return Promise.resolve([]);
            };
          }
          return undefined;
        },
      }
    );
  }
}

// Function to check if we have a valid database connection
const isDatabaseAvailable = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL !== "placeholder";
};

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    try {
      if (isDatabaseAvailable()) {
        return new PrismaClient({
          log: ["error"],
        });
      } else {
        console.warn("No database connection available. Using mock Prisma client.");
        return new MockPrismaClient() as unknown as PrismaClient;
      }
    } catch (error) {
      console.error("Failed to initialize Prisma client:", error);
      return new MockPrismaClient() as unknown as PrismaClient;
    }
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
