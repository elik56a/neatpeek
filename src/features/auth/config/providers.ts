import FigmaProvider from "@/features/auth/providers/figma-provider";
import GoogleProvider from "next-auth/providers/google";

export type ProviderConfig = {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  config?: Record<string, any>;
};

export const PROVIDERS: Record<string, ProviderConfig & { provider: any }> = {
  google: {
    id: "google",
    name: "Google",
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
    provider: GoogleProvider,
    config: {
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }
  },
  figma: {
    id: "figma",
    name: "Figma",
    clientId: process.env.FIGMA_CLIENT_ID!,
    clientSecret: process.env.FIGMA_CLIENT_SECRET!,
    provider: FigmaProvider,
    config: {}
  }
};

export type ProviderId = keyof typeof PROVIDERS; 