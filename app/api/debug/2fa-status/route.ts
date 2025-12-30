// app/api/debug/2fa-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, trustedDevice } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({
        error: 'Not authenticated',
        authenticated: false,
      });
    }

    // Get user from database
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    // Get device info
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwarded ? forwarded.split(',')[0] : realIp;
    const deviceId = Buffer.from(`${userAgent}:${ipAddress}`).toString(
      'base64',
    );

    // Check trusted device
    const trustedDeviceRecord = await db.query.trustedDevice.findFirst({
      where: and(
        eq(trustedDevice.userId, session.user.id),
        eq(trustedDevice.deviceId, deviceId),
      ),
    });

    // Get cookies
    const has2FAVerifiedCookie =
      request.cookies.get('2fa_verified')?.value === 'true';
    const hasTrustDeviceCookie = request.cookies.get(
      'better-auth.trust_device',
    )?.value;

    return NextResponse.json({
      authenticated: true,
      userId: session.user.id,
      email: session.user.email,
      twoFactorEnabled: {
        session: session.user.twoFactorEnabled,
        database: dbUser?.twoFactorEnabled,
        match: session.user.twoFactorEnabled === dbUser?.twoFactorEnabled,
      },
      deviceInfo: {
        deviceId: deviceId.substring(0, 20) + '...',
        ipAddress,
        userAgent: userAgent.substring(0, 50) + '...',
      },
      trustedDevice: {
        isTrusted: !!trustedDeviceRecord,
        deviceName: trustedDeviceRecord?.deviceName,
        lastUsed: trustedDeviceRecord?.lastUsed,
      },
      cookies: {
        has2FAVerified: has2FAVerifiedCookie,
        hasTrustDevice: !!hasTrustDeviceCookie,
      },
      shouldRequire2FA:
        dbUser?.twoFactorEnabled &&
        !trustedDeviceRecord &&
        !has2FAVerifiedCookie,
      recommendation:
        dbUser?.twoFactorEnabled &&
        !trustedDeviceRecord &&
        !has2FAVerifiedCookie
          ? '⚠️ You should be redirected to /2fa page'
          : '✅ No 2FA required - access allowed',
    });
  } catch (error) {
    console.error('Debug 2FA status error:', error);
    return NextResponse.json(
      { error: 'Failed to get debug info', details: String(error) },
      { status: 500 },
    );
  }
}
