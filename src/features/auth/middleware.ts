import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to protect routes and handle authentication
 * This runs before any request is processed
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const hostname = request.headers.get('host') || '';
  const path = request.nextUrl.pathname;

  // Check if the request is for the app subdomain
  const isAppSubdomain = hostname.startsWith('app.');

  // Define paths that should always be handled by the app
  const appPaths = [
    '/dashboard',
    '/brand-setup',
    '/design-review',
    '/design-history',
    '/settings',
    '/teams',
    '/company'
  ];

  // Check if the current path is an app path
  const isAppPath = appPaths.some(appPath => path.startsWith(appPath));

  // Marketing paths that should be accessible without authentication
  const marketingPaths = [
    '/',
    '/about',
    '/features',
    '/pricing',
    '/faq'
  ];

  // Check if the current path is a marketing path
  const isMarketingPath = marketingPaths.some(marketingPath =>
    path === marketingPath || path === `${marketingPath}/`
  );

  // Allow access to authentication routes and public assets
  if (
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.includes("favicon.ico") ||
    path.includes("/images/")
  ) {
    return NextResponse.next();
  }

  // If it's a marketing path, allow access without authentication
  if (isMarketingPath) {
    return NextResponse.next();
  }

  // If it's an app path but the user is not authenticated
  if (isAppPath && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If it's an app subdomain but the user is not authenticated
  if (isAppSubdomain && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // For all other requests, proceed normally
  return NextResponse.next();
}

// Configure middleware to run on all routes except static assets
export const config = {
  matcher: [
    // Match all paths except for static files, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
