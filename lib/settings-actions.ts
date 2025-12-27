/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db';
import { user, twoFactor, trustedDevice } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '../actions/auth-actions';
import * as OTPAuth from 'otpauth';

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

export async function enableTwoFactor() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    const secret = new OTPAuth.Secret({ size: 20 });
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    );

    await db.insert(twoFactor).values({
      userId: currentUser.id,
      secret: secret.base32,
      backupCodes: JSON.stringify(backupCodes),
    });

    await db
      .update(user)
      .set({ twoFactorEnabled: true })
      .where(eq(user.id, currentUser.id));

    return {
      success: true,
      secret: secret.base32,
      backupCodes,
    };
  } catch (error) {
    return { error: 'Failed to enable 2FA' };
  }
}

export async function disableTwoFactor() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    await db.delete(twoFactor).where(eq(twoFactor.userId, currentUser.id));

    await db
      .update(user)
      .set({ twoFactorEnabled: false })
      .where(eq(user.id, currentUser.id));

    return { success: true };
  } catch (error) {
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
