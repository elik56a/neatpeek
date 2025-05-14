import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiLogger } from "@/services/logger";
import { getToken } from "next-auth/jwt";

// List of public paths that don't require authentication
const publicPaths = ["/api/auth", "/api/health", "/_next", "/favicon.ico", "/images", "/fonts"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const isAppSubdomain = hostname.startsWith("app.");

  // Allow access to public paths
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If on app subdomain, enforce auth
  if (isAppSubdomain) {
    const token = await getToken({ req: request });

    if (!token) {
      if (pathname === "/") {
        // Rewrite "/" to login page but keep the URL as "/"
        const rewriteUrl = request.nextUrl.clone();
        rewriteUrl.pathname = "/login";
        return NextResponse.rewrite(rewriteUrl);
      }

      // For other pages, redirect to login with callback
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // ✅ If user is logged in and visiting "/", redirect to dashboard
    if (pathname === "/") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }

    // Logged in → continue and log with correlation ID
    const correlationId = request.headers.get("x-correlation-id") || crypto.randomUUID();
    apiLogger.setCorrelationId(correlationId);

    apiLogger.info("Incoming request", {
      path: pathname,
      method: request.method,
      userId: token.sub,
      userEmail: token.email,
      correlationId,
    });

    const response = NextResponse.next();
    response.headers.set("x-correlation-id", correlationId);
    return response;
  }

  // Non-app subdomains (e.g. marketing) → no auth required
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|api/health|_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
