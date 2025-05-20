// This file contains the server-side auth options for API routes
import { PROVIDERS } from "@/features/auth/config/providers";
import { comparePasswords } from "@/features/auth/server/auth-utils";
import { prisma } from "@/services/db/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  refreshFigmaToken,
  ensureFreshFigmaToken,
  TOKEN_REFRESH_CONSTANTS,
} from "@/features/auth/utils/figma-refresh-token";
import { TokenService } from "@/services/tokens";
import { encrypt } from "@/services/crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...Object.values(PROVIDERS).map(({ provider, clientId, clientSecret, config }) =>
      provider({
        clientId,
        clientSecret,
        ...config,
      })
    ),
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
          if (timeDiff < 15 * 60 * 1000) {
            // 15 minutes
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
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider && account.provider in PROVIDERS) {
        const providerId = account.provider as keyof typeof PROVIDERS;
        const provider = PROVIDERS[providerId];

        // Check if user exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: {
            accounts: true,
          },
        });

        if (!existingUser) {
          // Create new user
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || user.email!.split("@")[0],
              image: user.image,
              // For Figma, store user ID
              ...(providerId === "figma" && {
                figmaUserId: account.providerAccountId,
                // Do NOT store tokens here - we'll do it separately with encryption
                figmaTokenExpiry: account.expires_at ? new Date(account.expires_at * 1000) : null,
              }),
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  // Store encrypted access token and refresh token in the account model
                  access_token: account.access_token ? encrypt(account.access_token) : null,
                  refresh_token: account.refresh_token ? encrypt(account.refresh_token) : null,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                },
              },
            },
          });

          // Store encrypted Figma tokens separately for Figma provider
          if (providerId === "figma" && account.access_token && account.refresh_token) {
            await TokenService.storeFigmaTokens(
              newUser.id,
              account.access_token,
              account.refresh_token,
              account.expires_at
                ? new Date(account.expires_at * 1000)
                : new Date(Date.now() + TOKEN_REFRESH_CONSTANTS.DEFAULT_EXPIRY_SEC * 1000)
            );
          }
        } else {
          // Check if user already has an account with this provider
          const existingAccount = existingUser.accounts.find(
            acc => acc.provider === account.provider
          );

          if (!existingAccount) {
            // Link new provider account to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                // Store encrypted tokens in the account model
                access_token: account.access_token ? encrypt(account.access_token) : null,
                refresh_token: account.refresh_token ? encrypt(account.refresh_token) : null,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
              },
            });
          }

          // Update user data
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
              // For Figma, update user ID and expiry only
              ...(providerId === "figma" && {
                figmaUserId: account.providerAccountId,
                figmaTokenExpiry: account.expires_at ? new Date(account.expires_at * 1000) : null,
              }),
            },
          });

          // Store encrypted Figma tokens separately for Figma provider
          if (providerId === "figma" && account.access_token && account.refresh_token) {
            await TokenService.storeFigmaTokens(
              existingUser.id,
              account.access_token,
              account.refresh_token,
              account.expires_at
                ? new Date(account.expires_at * 1000)
                : new Date(Date.now() + TOKEN_REFRESH_CONSTANTS.DEFAULT_EXPIRY_SEC * 1000)
            );
          }
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Attach user info on login
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      // If account has figma tokens, add them to the token
      if (account?.provider === "figma" && account.access_token) {
        // Store unencrypted tokens in the JWT for session use
        token.figmaAccessToken = account.access_token;
        token.figmaRefreshToken = account.refresh_token;
        token.figmaTokenExpiry = account.expires_at
          ? new Date(account.expires_at * 1000)
          : new Date(Date.now() + TOKEN_REFRESH_CONSTANTS.DEFAULT_EXPIRY_SEC * 1000);
      }

      // If we don't have Figma tokens in the token but we have a user ID,
      // try to fetch the tokens from the database
      else if (token.id && !token.figmaAccessToken && !token.figmaRefreshToken) {
        try {
          // Get user with figma token fields
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              figmaAccessToken: true,
              figmaRefreshToken: true,
              figmaTokenExpiry: true,
            },
          });

          if (user?.figmaAccessToken && user?.figmaRefreshToken) {
            // We'll get decrypted tokens in the session
            const accessToken = await TokenService.getFigmaAccessToken(token.id as string);
            const refreshToken = await TokenService.getFigmaRefreshToken(token.id as string);

            if (accessToken && refreshToken) {
              token.figmaAccessToken = accessToken;
              token.figmaRefreshToken = refreshToken;
              token.figmaTokenExpiry = user.figmaTokenExpiry;
            }
          }
        } catch (error) {
          console.error("Error loading Figma tokens:", error);
        }
      }

      // Check if Figma token needs refresh - using extracted utility
      return ensureFreshFigmaToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;

        // Only indicate if the user has Figma connected, don't send actual tokens
        if (token.figmaAccessToken) {
          // Set a boolean flag instead of the actual token
          session.user.hasFigmaConnection = true;

          // Store expiry date for informational purposes only
          if (token.figmaTokenExpiry) {
            const tokenExpiry = token.figmaTokenExpiry;
            session.user.figmaTokenExpiry =
              typeof tokenExpiry === "string"
                ? new Date(tokenExpiry)
                : tokenExpiry instanceof Date
                  ? tokenExpiry
                  : undefined;
          }
        } else {
          session.user.hasFigmaConnection = false;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};
