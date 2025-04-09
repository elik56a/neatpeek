import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to protect routes and handle authentication
 * This runs before any request is processed
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Allow access if authenticated or trying to access an unprotected route
  const isAuthenticated = !!token;
  const path = request.nextUrl.pathname;

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

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protect these routes - only authenticated users can access
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/brand-setup/:path*",
    "/design-checker/:path*",
    "/design-history/:path*",
    "/settings/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
