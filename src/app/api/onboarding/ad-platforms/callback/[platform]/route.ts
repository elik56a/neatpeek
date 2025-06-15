// src/app/api/onboarding/ad-platforms/callback/[platform]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/auth';
import { db } from '@/services/db/prisma';

// Placeholder for client secrets and token URLs
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || 'YOUR_LINKEDIN_CLIENT_SECRET';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SessionUser { id: string; /* other properties */ }

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;

  if (!user || !user.id) {
    return NextResponse.redirect(new URL('/login', APP_URL)); // Redirect to login if no session
  }

  const platform = params.platform;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // Validate CSRF token (state)

  // Basic CSRF protection check (implement properly)
  if (state !== 'SOME_CSRF_TOKEN') { // Replace with actual CSRF token validation
      // return NextResponse.json({ message: 'Invalid state parameter' }, { status: 400 });
      console.warn("CSRF token mismatch or missing - this should be handled securely.");
  }

  if (!code) {
    return NextResponse.json({ message: 'Authorization code missing' }, { status: 400 });
  }

  try {
    switch (platform) {
      case 'linkedin':
        const tokenRedirectUri = `${APP_URL}/api/onboarding/ad-platforms/callback/linkedin`;
        const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
        const tokenParams = new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: tokenRedirectUri,
          client_id: process.env.LINKEDIN_CLIENT_ID || 'YOUR_LINKEDIN_CLIENT_ID',
          client_secret: LINKEDIN_CLIENT_SECRET,
        });

        const tokenResponse = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: tokenParams.toString(),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error('LinkedIn token exchange error:', errorData);
          throw new Error(`Failed to get access token from LinkedIn: ${errorData.error_description || tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        // Store tokenData.access_token, tokenData.refresh_token (if available), tokenData.expires_in
        // in the AdPlatformConnection model for the user.
        await db.adPlatformConnection.create({
          data: {
            userId: user.id,
            platformName: platform.toUpperCase(), // e.g. LINKEDIN
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token, // May not be provided by all platforms/flows
            expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
            // platformUserId: 'fetch from LinkedIn API if needed'
          },
        });
        break;
      // Add cases for 'googleads', 'facebook', 'instagram'
      default:
        return NextResponse.json({ message: 'Platform not supported for callback' }, { status: 400 });
    }

    // Redirect to the ad platform connection step, perhaps with a success query param
    return NextResponse.redirect(new URL('/onboarding/ad-platform-connection?status=success&platform=' + platform, APP_URL));

  } catch (error: any) {
    console.error(`Error connecting ${platform}:`, error.message);
    // Redirect to the ad platform connection step with an error query param
    return NextResponse.redirect(new URL(`/onboarding/ad-platform-connection?status=error&platform=${platform}&message=${encodeURIComponent(error.message)}`, APP_URL));
  }
}
