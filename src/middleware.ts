/**
 * Next.js requires the middleware file to be at the root of the src directory
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { apiLogger } from '@/services/logger';
import { v4 as uuidv4 } from 'uuid';
import { getToken } from 'next-auth/jwt';

// List of public paths that don't require authentication
const publicPaths = [
  "/api/auth",
  "/api/health",
  "/_next",
  "/favicon.ico",
  "/images",
  "/fonts",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const isAppSubdomain = hostname.startsWith("app.");

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If we're on the app subdomain, ensure we're authenticated
  if (isAppSubdomain) {
    const token = await getToken({ req: request });
    
    if (!token) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Set correlation ID for logging
    const correlationId = request.headers.get("x-correlation-id") || crypto.randomUUID();
    apiLogger.setCorrelationId(correlationId);

    // Log the request with user info
    apiLogger.info("Incoming request", {
      path: pathname,
      method: request.method,
      userId: token.sub,
      userEmail: token.email,
      correlationId,
    });

    // Add correlation ID to response headers
    const response = NextResponse.next();
    response.headers.set("x-correlation-id", correlationId);
    return response;
  }

  // For non-app subdomain requests, allow access to marketing site
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - api/health (health check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - fonts (public fonts)
     */
    "/((?!api/auth|api/health|_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
};
