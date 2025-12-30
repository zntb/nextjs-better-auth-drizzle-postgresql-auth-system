// app/api/auth/signout-with-cleanup/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear 2FA verification cookie
    cookieStore.delete('2fa_verified');
    cookieStore.delete('oauth_2fa_required');
    cookieStore.delete('oauth_provider');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out cleanup error:', error);
    return NextResponse.json({ error: 'Failed to cleanup' }, { status: 500 });
  }
}
