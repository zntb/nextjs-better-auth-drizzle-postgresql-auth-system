// app/api/auth/clear-oauth-2fa-cookies/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear OAuth 2FA cookies
    cookieStore.delete('oauth_2fa_required');
    cookieStore.delete('oauth_provider');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear OAuth 2FA cookies:', error);
    return NextResponse.json(
      { error: 'Failed to clear cookies' },
      { status: 500 },
    );
  }
}
