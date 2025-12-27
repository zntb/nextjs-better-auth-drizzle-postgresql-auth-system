'use server';

import { cookies } from 'next/headers';

/**
 * Clear the trust device cookie that's bypassing 2FA
 */
export async function clearTrustDeviceCookie() {
  try {
    const cookieStore = await cookies();

    // Delete the trust device cookie
    cookieStore.delete('better-auth.trust_device');

    // Also try with different path variations
    cookieStore.delete({
      name: 'better-auth.trust_device',
      path: '/',
    });

    return { success: true, message: 'Trust device cookie cleared' };
  } catch (error) {
    console.error('Failed to clear trust device cookie:', error);
    return { error: 'Failed to clear cookie', details: String(error) };
  }
}

/**
 * Clear all auth-related cookies (nuclear option)
 */
export async function clearAllAuthCookies() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Clear all cookies that contain 'auth', '2fa', or 'trust'
    const authCookies = allCookies.filter(
      c =>
        c.name.includes('auth') ||
        c.name.includes('2fa') ||
        c.name.includes('trust'),
    );

    for (const cookie of authCookies) {
      cookieStore.delete(cookie.name);
      cookieStore.delete({
        name: cookie.name,
        path: '/',
      });
    }

    return {
      success: true,
      message: `Cleared ${authCookies.length} auth cookies`,
      clearedCookies: authCookies.map(c => c.name),
    };
  } catch (error) {
    console.error('Failed to clear auth cookies:', error);
    return { error: 'Failed to clear cookies', details: String(error) };
  }
}
