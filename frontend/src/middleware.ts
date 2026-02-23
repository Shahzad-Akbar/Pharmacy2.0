import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('jwt')?.value;
  const role = request.cookies.get('role')?.value;

  // Define protected routes - more precise matching
  const protectedPrefixes = [
    '/admin',
    '/dashboard',
    '/profile',
    '/cart',
    '/orders',
    '/checkout',
    '/prescriptions',
    '/wishlist',
    '/product',
    '/productdetails'
  ];
  
  const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  // Define auth routes (login/signup/forgot-password)
  const isAuthRoute = 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/forgot-password' ||
    pathname.startsWith('/reset-password');

  // 1. Handle protected routes
  if (isProtectedRoute && !token) {
    console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to /login`);
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/login') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect logged-in users away from auth routes
  if (isAuthRoute && token) {
    console.log(`[Middleware] Logged-in user accessing auth route ${pathname}, redirecting to dashboard`);
    const targetUrl = role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // 3. Ensure admins don't access user dashboard and vice versa
  if (pathname.startsWith('/admin') && role !== 'admin' && token) {
    console.log(`[Middleware] Non-admin accessing admin route ${pathname}, redirecting to /dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/dashboard') && role === 'admin' && token) {
    console.log(`[Middleware] Admin accessing user dashboard ${pathname}, redirecting to /admin/dashboard`);
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  const response = NextResponse.next();

  // 3. Add Cache-Control headers for protected routes
  if (isProtectedRoute) {
    console.log(`[Middleware] Applying security headers to protected route: ${pathname}`);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/cart/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/prescriptions/:path*',
    '/wishlist/:path*',
    '/product/:path*',
    '/productdetails/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password/:path*',
  ],
};
