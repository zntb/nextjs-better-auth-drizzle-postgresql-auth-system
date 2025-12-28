/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db';
import { user, twoFactor, trustedDevice } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';
import { auth } from '@/lib/auth';
import { headers, cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  sendNotificationIfEnabled,
  sendNotificationPreferenceUpdateEmail,
} from '@/lib/auth/email';

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

    // Send security notification if user has security alerts enabled
    await sendNotificationIfEnabled(
      currentUser,
      'security',
      enabled ? 'password_auth_enabled' : 'password_auth_disabled',
    );

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

export async function confirmTwoFactorEnabled() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Send security notification that 2FA has been enabled
    await sendNotificationIfEnabled(currentUser, 'security', '2fa_enabled');

    return { success: true };
  } catch (error) {
    console.error('Confirm 2FA enabled error:', error);
    return { error: 'Failed to confirm 2FA enablement' };
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

    // Send security notification that 2FA has been disabled
    await sendNotificationIfEnabled(currentUser, 'security', '2fa_disabled');

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

export async function updateDefaultLoginMethod(method: 'email' | 'username') {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    await db
      .update(user)
      .set({ defaultLoginMethod: method })
      .where(eq(user.id, currentUser.id));

    // Send security notification if user has security alerts enabled
    await sendNotificationIfEnabled(
      currentUser,
      'security',
      'login_method_changed',
      method,
    );

    return { success: true };
  } catch (error) {
    return { error: 'Failed to update default login method' };
  }
}

export async function getCurrentDeviceTrustStatus() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Get current device information
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwarded ? forwarded.split(',')[0] : realIp;

    // Generate device ID from user agent and IP (same logic as check-2fa-and-trust.ts)
    const deviceId = Buffer.from(`${userAgent}:${ipAddress}`).toString(
      'base64',
    );

    // Check if this device is trusted
    const trustedDeviceRecord = await db.query.trustedDevice.findFirst({
      where: eq(trustedDevice.deviceId, deviceId),
    });

    // Generate device name from user agent
    let deviceName = 'Unknown Device';
    if (userAgent.includes('Chrome')) deviceName = 'Chrome Browser';
    else if (userAgent.includes('Firefox')) deviceName = 'Firefox Browser';
    else if (userAgent.includes('Safari')) deviceName = 'Safari Browser';
    else if (userAgent.includes('Edge')) deviceName = 'Edge Browser';

    return {
      success: true,
      isTrusted: !!trustedDeviceRecord,
      deviceId,
      deviceName,
      userAgent,
      ipAddress,
    };
  } catch (error) {
    console.error('Get current device trust status error:', error);
    return { error: 'Failed to get device trust status' };
  }
}

export async function toggleCurrentDeviceTrust() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Check if 2FA is enabled - trusted devices only make sense when 2FA is on
    if (!currentUser.twoFactorEnabled) {
      return {
        error:
          'Trusted devices are only available when two-factor authentication is enabled',
      };
    }

    // Get current device information
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwarded ? forwarded.split(',')[0] : realIp;

    // Generate device ID from user agent and IP
    const deviceId = Buffer.from(`${userAgent}:${ipAddress}`).toString(
      'base64',
    );

    // Check if this device is currently trusted
    const existingDevice = await db.query.trustedDevice.findFirst({
      where: eq(trustedDevice.deviceId, deviceId),
    });

    // Generate device name from user agent
    let deviceName = 'Unknown Device';
    if (userAgent.includes('Chrome')) deviceName = 'Chrome Browser';
    else if (userAgent.includes('Firefox')) deviceName = 'Firefox Browser';
    else if (userAgent.includes('Safari')) deviceName = 'Safari Browser';
    else if (userAgent.includes('Edge')) deviceName = 'Edge Browser';

    if (existingDevice) {
      // Device is currently trusted, so we need to remove it (turn off trust)
      await db
        .delete(trustedDevice)
        .where(eq(trustedDevice.id, existingDevice.id));

      // Clear trust device cookie if it exists
      const cookieStore = await cookies();
      cookieStore.delete('better-auth.trust_device');
      cookieStore.delete({
        name: 'better-auth.trust_device',
        path: '/',
      });

      return {
        success: true,
        isTrusted: false,
        message: 'Device trust disabled for current device',
      };
    } else {
      // Device is not trusted, so we need to add it (turn on trust)
      await db.insert(trustedDevice).values({
        userId: currentUser.id,
        deviceId,
        deviceName,
        userAgent,
        ipAddress,
      });

      return {
        success: true,
        isTrusted: true,
        message: 'Device trust enabled for current device',
      };
    }
  } catch (error) {
    console.error('Toggle current device trust error:', error);
    return { error: 'Failed to toggle device trust' };
  }
}

export async function updateNotificationPreferences(
  emailNotificationsEnabled: boolean,
  securityAlertsEnabled: boolean,
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Get current user data to check what changed
    const currentUserData = await db.query.user.findFirst({
      where: eq(user.id, currentUser.id),
    });

    if (!currentUserData) {
      return { error: 'User not found' };
    }

    // Update the notification preferences
    await db
      .update(user)
      .set({
        emailNotificationsEnabled,
        securityAlertsEnabled,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id));

    // Send notification preference update emails if preferences were changed
    if (
      currentUserData.emailNotificationsEnabled !== emailNotificationsEnabled
    ) {
      await sendNotificationPreferenceUpdateEmail(
        currentUser.email,
        currentUser.name,
        'email_notifications',
        emailNotificationsEnabled,
      );
    }

    if (currentUserData.securityAlertsEnabled !== securityAlertsEnabled) {
      await sendNotificationPreferenceUpdateEmail(
        currentUser.email,
        currentUser.name,
        'security_alerts',
        securityAlertsEnabled,
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return { error: 'Failed to update notification preferences' };
  }
}
