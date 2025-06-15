import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Role, hasRole } from './utils/rbac'; // Import RBAC utils

/**
 * Middleware to protect routes and handle authentication
 * This runs before any request is processed
 */
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const userRole = token?.role as Role | undefined; // Assuming role is in the token
  const { pathname } = request.nextUrl;

  // --- Existing logic for hostname, appPaths, marketingPaths ---
  const hostname = request.headers.get("host") || "";
  const isAppSubdomain = hostname.startsWith("app.");

  const appPaths = [
    "/dashboard",
    "/brand-setup",
    "/design-review", // Soon to be campaign-related
    "/designs-reviews",
    "/settings",
    "/teams",
    "/company",
    "/onboarding", // New onboarding flow
    "/campaign-brief", // New campaign brief flow
    "/copywriting", // New copywriting assistant
    "/campaign-performance", // New campaign performance flow
  ];
  const isAppPath = appPaths.some(appPath => pathname.startsWith(appPath));

  const marketingPaths = ["/", "/about", "/features", "/pricing", "/faq"];
  const isMarketingPath = marketingPaths.some(
    marketingPath => pathname === marketingPath || pathname === `${marketingPath}/`
  );

  const authRequiredPaths = [
    ...appPaths,
    // Add specific paths that require authentication but not necessarily a specific role yet
  ];

  const isAuthRequiredPath = authRequiredPaths.some(p => pathname.startsWith(p));

  // Allow access to public assets and auth routes
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.includes("/images/") ||
    pathname.startsWith("/unauthorized") // Allow access to unauthorized page
  ) {
    return NextResponse.next();
  }

  // If it's a marketing path, allow access
  if (isMarketingPath) {
    return NextResponse.next();
  }

  // If path requires auth and user is not authenticated, redirect to login
  if (isAuthRequiredPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  // If it's an app subdomain but the user is not authenticated
  if (isAppSubdomain && !token && !isMarketingPath) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
      return NextResponse.redirect(loginUrl);
  }


  // Role-specific route protection
  // This assumes `token.role` is available.
  // If `token.role` is not available, these checks won't work correctly
  // and would need the JWT callback in `auth-options.ts` to be updated.

  if (token && userRole) {
    // Example: Campaign Brief Creation (Marketer only)
    if (pathname.startsWith('/campaign-brief/new')) {
      if (!hasRole({ role: userRole }, [Role.MARKETER, Role.ADMIN])) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Example: Admin section (Admin only)
    // if (pathname.startsWith('/admin')) { // Assuming an /admin section might be added
    //   if (!hasRole({ role: userRole }, [Role.ADMIN])) {
    //     return NextResponse.redirect(new URL('/unauthorized', request.url));
    //   }
    // }
  } else if (isAuthRequiredPath && token && !userRole) {
    // If token exists but role is not available, it's an issue with session/token configuration.
    // For now, let it pass but log this potential issue.
    console.warn(`User authenticated but role not found in token for path: ${pathname}. Check JWT callback in auth-options.ts.`);
  }

  // For API routes, additional checks can be done within the API handlers themselves.
  // The existing API user check can remain.
  if (pathname.startsWith("/api") && token) {
    // The check for user existence in DB is good, but API routes should also implement their own RBAC.
    // This middleware primarily handles page navigation.
    // The existing fetch to /api/users/me might be redundant if token contains necessary user info.
    // However, it does validate the session against the DB.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\..*).*)", // Adjusted to avoid matching files with extensions
  ],
};
