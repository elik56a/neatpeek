import { authOptions } from "./auth-options";
import NextAuth from "next-auth";

// Use server-side auth options to prevent bcrypt bundling issues
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
