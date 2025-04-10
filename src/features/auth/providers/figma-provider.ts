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
    token: "https://www.figma.com/api/oauth/token",
    userinfo: {
      url: "https://api.figma.com/v1/me",
      async request({ tokens, provider }) {
        const response = await fetch(provider.userinfo?.url as string, {
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
