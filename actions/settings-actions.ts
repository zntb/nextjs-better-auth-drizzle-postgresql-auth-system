/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db';
import { user, twoFactor, trustedDevice } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';
import { auth } from '@/lib/auth';
import { headers, cookies } from 'next/headers';
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

    // Return the TOTP URI and backup codes for user to scan and verify
    // 2FA is NOT fully enabled yet - user must verify with a code
    return {
      success: true,
      totpURI: result.totpURI,
      backupCodes: result.backupCodes,
    };
  } catch (error) {
    console.error('Enable 2FA error:', error);
    if (error instanceof Error && error.message.includes('Invalid password')) {
      return { error: 'Invalid password. Please try again.' };
    }
    return { error: 'Failed to enable 2FA' };
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

    // Clear trusted device cookie to ensure all sessions require 2FA again
    const cookieStore = await cookies();
    cookieStore.delete('better-auth.trust_device');
    cookieStore.delete({
      name: 'better-auth.trust_device',
      path: '/',
    });

    // Also clear any other potential trust-related cookies
    const allCookies = cookieStore.getAll();
    const trustCookies = allCookies.filter(
      c => c.name.includes('trust') || c.name.includes('2fa_trust'),
    );

    for (const cookie of trustCookies) {
      cookieStore.delete(cookie.name);
      cookieStore.delete({
        name: cookie.name,
        path: '/',
      });
    }

    // Revalidate paths
    revalidatePath('/settings');
    revalidatePath('/profile');

    return { success: true };
  } catch (error) {
    console.error('Disable 2FA error:', error);
    if (error instanceof Error && error.message.includes('Invalid password')) {
      return { error: 'Invalid password. Please try again.' };
    }
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
