// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/profile', '/settings'];
  const adminRoutes = ['/admin'];
  const authRoutes = ['/login', '/register'];

  // IMPORTANT: Don't redirect from the 2FA page
  const skip2FACheck = ['/2fa', '/debug-2fa'];

  // Check if user is blocked (but don't redirect if already on blocked page)
  if (session?.user?.blocked && !pathname.startsWith('/blocked')) {
    return NextResponse.redirect(new URL('/blocked', request.url));
  }

  // Admin routes protection
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protected routes - but allow access to /2fa page
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  // BUT don't redirect from /2fa page
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (session && !skip2FACheck.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
