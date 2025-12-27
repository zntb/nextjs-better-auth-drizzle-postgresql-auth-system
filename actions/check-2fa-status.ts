'use server';

import { db } from '@/lib/db';
import { user, twoFactor } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';

/**
 * Check the actual 2FA status from the database
 * This helps debug 2FA issues
 */
export async function check2FAStatus() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Get user from database
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, currentUser.id),
    });

    // Get 2FA record from database
    const twoFactorRecord = await db.query.twoFactor.findFirst({
      where: eq(twoFactor.userId, currentUser.id),
    });

    return {
      success: true,
      status: {
        // From session
        sessionTwoFactorEnabled: currentUser.twoFactorEnabled,

        // From database
        dbTwoFactorEnabled: dbUser?.twoFactorEnabled,

        // Check if 2FA record exists
        has2FARecord: !!twoFactorRecord,
        hasSecret: !!twoFactorRecord?.secret,
        hasBackupCodes: !!twoFactorRecord?.backupCodes,

        // Match status
        sessionMatchesDb:
          currentUser.twoFactorEnabled === dbUser?.twoFactorEnabled,
      },
    };
  } catch (error) {
    console.error('Check 2FA status error:', error);
    return { error: 'Failed to check 2FA status' };
  }
}
