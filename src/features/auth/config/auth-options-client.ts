import FigmaProvider from "@/features/auth/providers/figma-provider";
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

// This is a client-safe version of auth options that doesn't use bcrypt directly
// The actual password verification happens on the server side
export const authOptionsClient: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
          return null;
        }

        try {
          // Make a server-side API call to verify credentials
          const response = await fetch('/api/auth/verify-credentials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          if (!response.ok) {
            return null;
          }

          const user = await response.json();
          return user;
        } catch (error) {
          console.error('Error verifying credentials:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to the dashboard
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      }
      // Allows relative callback URLs
      else if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
    async signIn({ user, account }) {
      // Store Figma tokens in the user record when signing in with Figma
      if (account?.provider === "figma" && user.email) {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              figmaUserId: user.id,
              figmaAccessToken: account.access_token,
              figmaRefreshToken: account.refresh_token,
              figmaTokenExpiry: account.expires_at
                ? new Date(account.expires_at * 1000)
                : undefined,
            },
          });
        } catch (error) {
          console.error("Error updating user with Figma tokens:", error);
          // Continue with sign in even if token storage fails
        }
      }

      // Always allow sign in
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      try {
        // Handle session update
        if (trigger === "update" && session) {
          // Prevent infinite loops by limiting the number of updates
          sessionUpdateCount++;
          if (sessionUpdateCount > MAX_SESSION_UPDATES) {
            console.error("Too many session updates, possible infinite loop detected");
            return token;
          }

          // Update token with new session data
          if (session.companyId) {
            token.companyId = session.companyId;
          }

          if (session.companyRole) {
            token.companyRole = session.companyRole;
          }

          // Try to fetch company name if companyId is present
          if (session.companyId && !token.companyName) {
            try {
              const company = await prisma.company.findUnique({
                where: { id: session.companyId },
                select: { name: true }
              });

              if (company) {
                token.companyName = company.name;
              }
            } catch (error) {
              console.error("Error fetching company:", error);
            }
          }

          return token;
        }

        // Add the user ID to the token when a user signs in
        if (user) {
          token.id = user.id;
          token.sub = user.id; // Ensure sub is set to user ID

          // Store Figma tokens in the token
          if (account?.provider === "figma") {
            token.figmaUserId = user.id;
            token.figmaAccessToken = account.access_token;
            token.figmaRefreshToken = account.refresh_token;
            token.figmaTokenExpiry = account.expires_at;
          }

          // Try to fetch company information
          // @ts-ignore - TypeScript doesn't know about our custom fields
          if (user.companyId) {
            // @ts-ignore
            token.companyId = user.companyId;
            // @ts-ignore
            token.companyRole = user.companyRole;

            // Try to fetch company name
            try {
              // @ts-ignore
              const company = await prisma.company.findUnique({
                // @ts-ignore
                where: { id: user.companyId },
                select: { name: true }
              });

              if (company) {
                token.companyName = company.name;
              }
            } catch (error) {
              console.error("Error fetching company:", error);
            }
          }
        }

        // Update lastLogin for Google OAuth users
        if (account && account.provider === "google" && token.email) {
          await prisma.user.update({
            where: { email: token.email },
            data: { lastLogin: new Date() },
          });
        }

        // Disable logging to prevent infinite loop
        // console.log("JWT token created:", token);
      } catch (error) {
        console.error("Error in JWT callback:", error);
      }

      return token;
    },
    async session({ session, token }) {
      try {
        if (session.user && token.email) {
          // Set the user ID from the token
          session.user.id = token.sub as string;

          // If we have additional data in the token, add it to the session
          if (token.name) session.user.name = token.name as string;
          if (token.email) session.user.email = token.email as string;
          if (token.picture) session.user.image = token.picture as string;

          // Add Figma tokens to the session
          if (token.figmaUserId) {
            // @ts-ignore - Add custom fields to session
            session.user.figmaUserId = token.figmaUserId as string;
          }

          if (token.figmaAccessToken) {
            // @ts-ignore - Add custom fields to session
            session.user.figmaAccessToken = token.figmaAccessToken as string;
          }

          // Add custom fields if they exist in the token
          if (token.companyId) {
            // @ts-ignore - Add custom fields to session
            session.user.companyId = token.companyId as string;
          }

          if (token.companyRole) {
            // @ts-ignore - Add custom fields to session
            session.user.companyRole = token.companyRole as string;
          }

          if (token.companyName) {
            // @ts-ignore - Add custom fields to session
            session.user.companyName = token.companyName as string;
          }

          // Disable logging to prevent infinite loop
          // console.log("Session created successfully:", session);
        }
      } catch (error) {
        console.error("Error in session callback:", error);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Disable debug mode
};
