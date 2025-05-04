/**
 * Next.js requires the middleware file to be at the root of the src directory
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { apiLogger } from '@/services/logger';
import { v4 as uuidv4 } from 'uuid';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Generate a correlation ID for the request
  const correlationId = uuidv4();
  apiLogger.setCorrelationId(correlationId);

  // Get the JWT token from the request
  const token = await getToken({ req: request });

  // Extract user information from the token
  const userInfo = {
    id: token?.sub || 'anonymous',
    email: token?.email || 'unknown',
  };

  // Log the incoming request with user information
  apiLogger.logRequest(
    request.method,
    request.nextUrl.pathname,
    {
      module: 'middleware',
      metadata: {
        user: userInfo,
        query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      },
    }
  );

  // Add correlation ID to response headers
  const response = NextResponse.next();
  response.headers.set('X-Correlation-ID', correlationId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
