// This file contains the server-side auth options for API routes
import FigmaProvider from "@/features/auth/providers/figma-provider";
import { comparePasswords } from "@/features/auth/server/auth-utils";
import { prisma } from "@/services/db/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Disable console logs to prevent infinite loop
const originalConsoleLog = console.log;
console.log = function(...args: any[]) {
  // Filter out session and token logs
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Session created successfully') ||
     args[0].includes('JWT token created'))
  ) {
    return;
  }
  originalConsoleLog.apply(console, args);
};

// Track session updates to prevent infinite loops
let sessionUpdateCount = 0;
const MAX_SESSION_UPDATES = 5; // Maximum number of session updates allowed

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),

    FigmaProvider({
      clientId: process.env.FIGMA_CLIENT_ID!,
      clientSecret: process.env.FIGMA_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Rate limiting check
        const rateLimitKey = `login:${credentials.email}`;
        const attempts = await prisma.rateLimit.findUnique({
          where: { key: rateLimitKey },
        });

        if (attempts && attempts.count >= 5) {
          const lastAttempt = attempts.updatedAt;
          const timeDiff = Date.now() - lastAttempt.getTime();
          if (timeDiff < 15 * 60 * 1000) { // 15 minutes
            throw new Error("Too many login attempts. Please try again later.");
          }
          // Reset attempts if time has passed
          await prisma.rateLimit.update({
            where: { key: rateLimitKey },
            data: { count: 0 },
          });
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          // Increment failed attempts
          await prisma.rateLimit.upsert({
            where: { key: rateLimitKey },
            create: { key: rateLimitKey, count: 1 },
            update: { count: { increment: 1 } },
          });
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await comparePasswords(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          // Increment failed attempts
          await prisma.rateLimit.upsert({
            where: { key: rateLimitKey },
            create: { key: rateLimitKey, count: 1 },
            update: { count: { increment: 1 } },
          });
          throw new Error("Invalid email or password");
        }

        // Reset rate limit on successful login
        await prisma.rateLimit.upsert({
          where: { key: rateLimitKey },
          update: { count: 0 },
          create: { key: rateLimitKey, count: 0 },
        });

        // Update lastLogin time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};
