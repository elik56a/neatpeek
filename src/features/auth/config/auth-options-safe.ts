"use client";

import FigmaProvider from "@/features/auth/providers/figma-provider";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Client-safe version of auth options without Prisma imports
export const authOptionsSafe: Partial<NextAuthOptions> = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
    }),
    FigmaProvider({
      clientId: process.env.FIGMA_CLIENT_ID || "",
      clientSecret: process.env.FIGMA_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // In the client-safe version, we don't actually authorize here
          // This is just a placeholder for the client-side type system
          return null;
        } catch (error) {
          console.error("Error during credentials authorization:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // These are just type placeholders for the client
    async jwt({ token, user, account }) {
      return token;
    },
    async session({ session, token }) {
      return session;
    },
  },
};
