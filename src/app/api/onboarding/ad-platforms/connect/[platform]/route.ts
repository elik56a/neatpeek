// src/app/api/onboarding/ad-platforms/connect/[platform]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/features/auth';

// Placeholder for actual OAuth client IDs and redirect URIs
// These should come from environment variables
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || 'YOUR_LINKEDIN_CLIENT_ID';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const platform = params.platform;
  let authorizationUrl = '';

  switch (platform) {
    case 'linkedin':
      const redirectUri = `${APP_URL}/api/onboarding/ad-platforms/callback/linkedin`;
      const scope = 'r_liteprofile r_emailaddress w_member_social_feed ads_read ads_management'; // Example scopes
      authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=SOME_CSRF_TOKEN&scope=${encodeURIComponent(scope)}`;
      break;
    // Add cases for 'googleads', 'facebook', 'instagram'
    default:
      return NextResponse.json({ message: 'Platform not supported' }, { status: 400 });
  }

  return NextResponse.redirect(authorizationUrl);
}
