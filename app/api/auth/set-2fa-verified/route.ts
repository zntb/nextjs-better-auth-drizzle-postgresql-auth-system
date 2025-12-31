// app/api/auth/set-2fa-verified/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Set a cookie that indicates 2FA has been verified for this session
    // This cookie expires when the browser session ends
    const response = NextResponse.json({ success: true });

    response.cookies.set('2fa_verified', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // No maxAge = session cookie (expires when browser closes)
    });

    console.log('✅ Set 2fa_verified cookie');

    return response;
  } catch (error) {
    console.error('Failed to set 2FA verified cookie:', error);
    return NextResponse.json(
      { error: 'Failed to set cookie' },
      { status: 500 },
    );
  }
}
