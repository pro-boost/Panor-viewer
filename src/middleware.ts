import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/api/projects',
  '/api/poi',
  '/api/files',
  '/upload',
  '/poi-management'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/setup',
  '/api/auth'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/icon')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || 
                          pathname.match(/^\/[^/]+$/) || // Project routes like /project-id
                          pathname === '/';

  if (isProtectedRoute) {
    const supabaseAccessToken = request.cookies.get('supabase-access-token')?.value;
    const supabaseRefreshToken = request.cookies.get('supabase-refresh-token')?.value;
    
    // Check if user is authenticated
    if (!supabaseAccessToken) {
      // Redirect to login page
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Basic token validation - just check if it exists and looks like a JWT
    if (supabaseAccessToken) {
      try {
        // Basic JWT format validation (header.payload.signature)
        const parts = supabaseAccessToken.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        // Decode payload to check expiration
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        const now = Math.floor(Date.now() / 1000);
        
        // Check if token is expired
        if (payload.exp && payload.exp < now) {
          // Token expired, redirect to login
          const response = NextResponse.redirect(new URL('/auth/login', request.url));
          response.cookies.delete('supabase-access-token');
          response.cookies.delete('supabase-refresh-token');
          return response;
        }
      } catch {
        // Invalid token, redirect to login
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('supabase-access-token');
        response.cookies.delete('supabase-refresh-token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};