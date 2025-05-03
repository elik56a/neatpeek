import { PrismaClient } from "@prisma/client";

declare module "@prisma/client" {
  interface PrismaClient {
    user: {
      findUnique: (args: {
        where: { email: string };
        select: {
          id: true;
          companyId: true;
        };
      }) => Promise<{
        id: string;
        companyId: string | null;
      } | null>;
    };
    team: {
      findUnique: (args: {
        where: { id: string };
        select: {
          companyId: true;
        };
      }) => Promise<{
        companyId: string | null;
      } | null>;
    };
  }
}
