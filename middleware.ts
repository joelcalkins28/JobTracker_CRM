import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/callback/google',
  '/api/auth/google/authorize',
  '/api/auth/[...nextauth]',
];

/**
 * Authentication middleware
 * Simple check for token presence - actual verification happens in API routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public (no auth required)
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Allow public paths without authentication
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Allow API routes without redirection (they will handle auth themselves)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Check for auth token presence only
  // Note: Full verification is done in the API routes, not in Edge middleware
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    // Redirect to login if no token
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }
  
  // Continue to protected route - token validation will happen in the API routes
  return NextResponse.next();
}

/**
 * Configure the middleware to run on specific paths
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - API routes that handle their own authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|api/auth/callback|api/auth/\\[\\.\\.\\.|api/auth/google).*)',
  ],
}; 