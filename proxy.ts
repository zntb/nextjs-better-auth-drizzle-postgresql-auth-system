// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, trustedDevice } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files, and auth callback routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Protected routes
  const protectedRoutes = ['/profile', '/settings'];
  const adminRoutes = ['/admin'];
  const authRoutes = ['/login', '/register'];
  const skip2FACheck = ['/2fa', '/debug-2fa', '/blocked'];

  // Check if user is blocked (but don't redirect if already on blocked page)
  if (session?.user?.blocked && !pathname.startsWith('/blocked')) {
    return NextResponse.redirect(new URL('/blocked', request.url));
  }

  // If user is authenticated and NOT on 2FA/blocked page, check for 2FA requirement
  if (
    session?.user &&
    !skip2FACheck.some(route => pathname.startsWith(route))
  ) {
    try {
      // Check if user has 2FA enabled
      const dbUser = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
      });

      if (dbUser?.twoFactorEnabled) {
        // Check if this device is trusted
        const userAgent = request.headers.get('user-agent') || '';
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const ipAddress = forwarded ? forwarded.split(',')[0] : realIp;
        const deviceId = Buffer.from(`${userAgent}:${ipAddress}`).toString(
          'base64',
        );

        const trustedDeviceRecord = await db.query.trustedDevice.findFirst({
          where: and(
            eq(trustedDevice.userId, session.user.id),
            eq(trustedDevice.deviceId, deviceId),
          ),
        });

        // Check if user has completed 2FA verification for this session
        const has2FAVerified =
          request.cookies.get('2fa_verified')?.value === 'true';

        // If device is not trusted and 2FA not verified, redirect to 2FA page
        if (!trustedDeviceRecord && !has2FAVerified) {
          console.log('🔐 2FA required - redirecting to /2fa');
          return NextResponse.redirect(new URL('/2fa', request.url));
        }
      }
    } catch (error) {
      console.error('2FA check error in middleware:', error);
    }
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

  // Protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
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
