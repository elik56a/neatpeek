import { OAuthConfig, OAuthUserConfig } from "next-auth/providers";

interface FigmaProfile {
  id: string;
  email: string;
  handle: string;
  img_url: string;
}

export default function FigmaProvider<P extends FigmaProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "figma",
    name: "Figma",
    type: "oauth",
    authorization: {
      url: "https://www.figma.com/oauth",
      params: { scope: "file_read" },
    },
    // Note: The authorization URL is still www.figma.com/oauth (not migrated to api.figma.com)
    // Only the token endpoint has been migrated
    token: {
      url: "https://api.figma.com/v1/oauth/token",
      async request(context) {
        const tokenUrl = "https://api.figma.com/v1/oauth/token";
        const response = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add basic auth header as an alternative way to authenticate
            Authorization:
              "Basic " +
              Buffer.from(`${context.provider.clientId}:${context.provider.clientSecret}`).toString(
                "base64"
              ),
          },
          body: JSON.stringify({
            client_id: context.provider.clientId,
            client_secret: context.provider.clientSecret,
            code: context.params.code,
            grant_type: "authorization_code",
            redirect_uri: context.provider.callbackUrl,
          }),
        });

        let tokens: any;
        try {
          tokens = await response.json();
        } catch (error) {
          console.error("Failed to parse Figma token response:", error);
          throw new Error("Failed to parse Figma token response");
        }

        if (!response.ok) {
          console.error("Figma token error:", tokens);
          console.error("Figma token request details:", {
            url: tokenUrl,
            status: response.status,
            statusText: response.statusText,
            requestBody: {
              client_id: context.provider.clientId,
              // client_secret: '[REDACTED]',
              code: context.params.code,
              grant_type: "authorization_code",
              redirect_uri: context.provider.callbackUrl,
            },
          });

          // Log additional information for debugging
          console.error("Figma OAuth environment variables:", {
            FIGMA_CLIENT_ID: process.env.FIGMA_CLIENT_ID ? "Set" : "Not set",
            FIGMA_CLIENT_SECRET: process.env.FIGMA_CLIENT_SECRET ? "Set" : "Not set",
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
          });
          throw new Error(
            tokens.message || tokens.error_description || "Failed to get access token"
          );
        }

        return { tokens };
      },
    },
    userinfo: {
      url: "https://api.figma.com/v1/me",
      async request({ tokens }) {
        const userinfoUrl = "https://api.figma.com/v1/me";
        const response = await fetch(userinfoUrl, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user info from Figma");
        }

        const data = await response.json();
        return data;
      },
    },
    profile(profile) {
      return {
        id: profile.id,
        name: profile.handle,
        email: profile.email,
        image: profile.img_url,
        figmaUserId: profile.id,
        figmaAccessToken: null, // Will be set in the callbacks
      };
    },
    options,
  };
}
