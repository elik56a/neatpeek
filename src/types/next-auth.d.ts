import { CompanyRole } from '@prisma/client';
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id */
      id: string;
      /** The user's role in the application */
      role?: string;
      /** The user's company ID */
      companyId?: string;
      /** The user's company name */
      companyName?: string;
      /** The user's role in the company */
      companyRole?: CompanyRole;
    } & DefaultSession["user"];
  }
}
