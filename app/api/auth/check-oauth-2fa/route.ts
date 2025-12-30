// app/api/auth/check-oauth-2fa/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { user, trustedDevice } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST() {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ requires2FA: false });
    }

    // Check if user has 2FA enabled
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!dbUser?.twoFactorEnabled) {
      return NextResponse.json({ requires2FA: false });
    }

    // Check if current device is trusted
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwarded ? forwarded.split(',')[0] : realIp;

    // Generate device ID
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
      // Device is trusted
      return NextResponse.json({ requires2FA: false });
    }

    // 2FA is required
    return NextResponse.json({
      requires2FA: true,
      userId: session.user.id,
      deviceId,
    });
  } catch (error) {
    console.error('Check OAuth 2FA error:', error);
    return NextResponse.json({
      requires2FA: false,
      error: 'Failed to check 2FA status',
    });
  }
}
