/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db';
import { user, twoFactor, trustedDevice } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function toggleEmailPassword(enabled: boolean) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    await db
      .update(user)
      .set({ emailPasswordEnabled: enabled })
      .where(eq(user.id, currentUser.id));

    return { success: true };
  } catch (error) {
    return { error: 'Failed to update setting' };
  }
}

export async function enableTwoFactor(password: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Use Better Auth's built-in 2FA API
    const result = await auth.api.enableTwoFactor({
      body: {
        password,
      },
      headers: await headers(),
    });

    if (!result) {
      return { error: 'Failed to enable 2FA. Please check your password.' };
    }

    // 2FA is enabled but requires verification
    // Return the TOTP URI and backup codes, and indicate that verification is needed
    return {
      success: true,
      needsVerification: true,
      totpURI: result.totpURI,
      backupCodes: result.backupCodes,
    };
  } catch (error) {
    console.error('Enable 2FA error:', error);
    return { error: 'Failed to enable 2FA' };
  }
}

export async function verifyTwoFactor(code: string) {
  try {
    const result = await auth.api.verifyTOTP({
      body: {
        code,
      },
      headers: await headers(),
    });

    if (!result) {
      return { error: 'Invalid verification code' };
    }

    // After successful verification, update the user in the database
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await db
        .update(user)
        .set({ twoFactorEnabled: true })
        .where(eq(user.id, currentUser.id));
    }

    // Revalidate paths to refresh the session
    revalidatePath('/settings');
    revalidatePath('/profile');

    return { success: true };
  } catch (error) {
    console.error('Verify 2FA error:', error);
    return { error: 'Failed to verify 2FA code' };
  }
}

export async function disableTwoFactor(password: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Use Better Auth's built-in 2FA API
    const result = await auth.api.disableTwoFactor({
      body: {
        password,
      },
      headers: await headers(),
    });

    if (!result) {
      return { error: 'Failed to disable 2FA. Please check your password.' };
    }

    // Update the database
    await db
      .update(user)
      .set({ twoFactorEnabled: false })
      .where(eq(user.id, currentUser.id));

    // Revalidate paths
    revalidatePath('/settings');
    revalidatePath('/profile');

    return { success: true };
  } catch (error) {
    console.error('Disable 2FA error:', error);
    return { error: 'Failed to disable 2FA' };
  }
}

export async function getTrustedDevices() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    const devices = await db.query.trustedDevice.findMany({
      where: eq(trustedDevice.userId, currentUser.id),
    });

    return { success: true, devices };
  } catch (error) {
    return { error: 'Failed to get devices' };
  }
}

export async function removeTrustedDevice(deviceId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    await db.delete(trustedDevice).where(eq(trustedDevice.id, deviceId));

    return { success: true };
  } catch (error) {
    return { error: 'Failed to remove device' };
  }
}

export async function deleteAccount() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    await db.delete(user).where(eq(user.id, currentUser.id));

    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete account' };
  }
}
