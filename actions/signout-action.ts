// actions/signout-action.ts
'use server';

import { cookies } from 'next/headers';

export async function signOutAction() {
  try {
    const cookieStore = await cookies();

    // Clear the 2FA verified cookie
    cookieStore.delete('2fa_verified');

    // Also clear any OAuth-related cookies if they exist
    cookieStore.delete('oauth_2fa_required');
    cookieStore.delete('oauth_provider');

    console.log('✅ Cleared 2FA cookies on sign out');

    return { success: true };
  } catch (error) {
    console.error('Failed to clear cookies on sign out:', error);
    return { error: 'Failed to clear cookies' };
  }
}
