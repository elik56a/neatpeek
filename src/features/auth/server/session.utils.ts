import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession as getServerSessionNextAuth } from "next-auth";
import type { Session } from "next-auth";

export const getServerSession = async (): Promise<Session | null> => {
  return await getServerSessionNextAuth(authOptions);
};
