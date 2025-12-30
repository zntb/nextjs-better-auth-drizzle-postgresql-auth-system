// app/api/auth/callback/[provider]/route.ts
// This handler intercepts OAuth callbacks to check for 2FA requirements
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers, cookies } from 'next/headers';
import { db } from '@/lib/db';
import { user, trustedDevice } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params;

    // Let Better Auth handle the OAuth callback first
    const response = await auth.handler(request);

    // Get the session after OAuth login
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      // OAuth login failed or user cancelled
      return response;
    }

    // Check if user has 2FA enabled
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!dbUser?.twoFactorEnabled) {
      // No 2FA required, continue with normal OAuth flow
      return response;
    }

    // Check if current device is trusted
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwarded ? forwarded.split(',')[0] : realIp;

    // Generate device ID (same logic as in check-2fa-and-trust.ts)
    const deviceId = Buffer.from(`${userAgent}:${ipAddress}`).toString(
      'base64',
    );

    // Check if this device is trusted
    const trustedDeviceRecord = await db.query.trustedDevice.findFirst({
      where: and(
        eq(trustedDevice.userId, session.user.id),
        eq(trustedDevice.deviceId, deviceId),
      ),
    });

    if (trustedDeviceRecord) {
      // Device is trusted, allow login
      return response;
    }

    // 2FA is required - store pending OAuth session info and redirect to 2FA page
    const cookieStore = await cookies();

    // Store that we need 2FA verification for this OAuth session
    cookieStore.set('oauth_2fa_required', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Store the provider for display purposes
    cookieStore.set('oauth_provider', provider, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    // Redirect to 2FA page
    return NextResponse.redirect(new URL('/2fa?oauth=true', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', request.url),
    );
  }
}
