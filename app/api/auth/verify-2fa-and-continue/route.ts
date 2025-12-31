// app/api/auth/verify-2fa-and-continue/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 },
      );
    }

    // Verify the TOTP code using Better Auth
    const result = await auth.api.verifyTOTP({
      body: { code },
      headers: await headers(),
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 },
      );
    }

    // Set the 2FA verified cookie
    const response = NextResponse.json({
      success: true,
      message: '2FA verified successfully',
    });

    response.cookies.set('2fa_verified', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    console.log('✅ 2FA verified and cookie set');
    return response;
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA code' },
      { status: 500 },
    );
  }
}
