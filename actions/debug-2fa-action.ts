'use server';

import { db } from '@/lib/db';
import { user, twoFactor, trustedDevice } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';
import { cookies } from 'next/headers';

/**
 * Comprehensive 2FA debugging action
 */
export async function debug2FA() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Not logged in' };
    }

    // Get user from database
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, currentUser.id),
    });

    // Get 2FA record from database
    const twoFactorRecord = await db.query.twoFactor.findFirst({
      where: eq(twoFactor.userId, currentUser.id),
    });

    // Get trusted devices
    const trustedDevices = await db.query.trustedDevice.findMany({
      where: eq(trustedDevice.userId, currentUser.id),
    });

    // Get all cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const relevantCookies = allCookies
      .filter(
        c =>
          c.name.includes('auth') ||
          c.name.includes('2fa') ||
          c.name.includes('trust') ||
          c.name.includes('better'),
      )
      .map(c => ({ name: c.name, hasValue: !!c.value }));

    return {
      success: true,
      debug: {
        // User info
        userId: currentUser.id,
        userEmail: currentUser.email,

        // Session state
        sessionTwoFactorEnabled: currentUser.twoFactorEnabled,

        // Database state
        dbTwoFactorEnabled: dbUser?.twoFactorEnabled,

        // 2FA record
        has2FARecord: !!twoFactorRecord,
        hasSecret: !!twoFactorRecord?.secret,
        secretLength: twoFactorRecord?.secret?.length || 0,
        hasBackupCodes: !!twoFactorRecord?.backupCodes,

        // Trusted devices
        trustedDeviceCount: trustedDevices.length,
        trustedDevices: trustedDevices.map(d => ({
          id: d.id,
          deviceName: d.deviceName,
          lastUsed: d.lastUsed,
        })),

        // Cookies
        relevantCookies,

        // State comparison
        sessionMatchesDb:
          currentUser.twoFactorEnabled === dbUser?.twoFactorEnabled,
        ready2FA:
          !!twoFactorRecord?.secret && dbUser?.twoFactorEnabled === true,
      },
    };
  } catch (error) {
    console.error('Debug 2FA error:', error);
    return { error: 'Failed to debug 2FA', details: String(error) };
  }
}

/**
 * Clear all trusted devices for the current user
 */
export async function clearTrustedDevices() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    await db
      .delete(trustedDevice)
      .where(eq(trustedDevice.userId, currentUser.id));

    return { success: true, message: 'All trusted devices cleared' };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: 'Failed to clear trusted devices' };
  }
}

/**
 * Force update 2FA status in database
 */
export async function force2FAStatus(enabled: boolean) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    await db
      .update(user)
      .set({ twoFactorEnabled: enabled })
      .where(eq(user.id, currentUser.id));

    return { success: true, message: `2FA status set to: ${enabled}` };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: 'Failed to update 2FA status' };
  }
}
