'use server';

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';
import { revalidatePath } from 'next/cache';
import {
  sendNotificationIfEnabled,
  sendNotificationPreferenceUpdateEmail,
} from '@/lib/auth/email';
import { normalizeUserForNotifications } from '@/lib/utils';

// Get current user's notification preferences
export async function getUserNotificationPreferences() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    const userData = await db.query.user.findFirst({
      where: eq(user.id, currentUser.id),
    });

    if (!userData) {
      return { error: 'User not found' };
    }

    return {
      success: true,
      preferences: {
        emailNotificationsEnabled: userData.emailNotificationsEnabled,
        securityAlertsEnabled: userData.securityAlertsEnabled,
      },
    };
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return { error: 'Failed to get notification preferences' };
  }
}

// Get notification preferences for a specific user (admin only)
export async function getUserNotificationPreferencesById(userId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userData) {
      return { error: 'User not found' };
    }

    return {
      success: true,
      preferences: {
        emailNotificationsEnabled: userData.emailNotificationsEnabled,
        securityAlertsEnabled: userData.securityAlertsEnabled,
      },
    };
  } catch (error) {
    console.error('Get user notification preferences error:', error);
    return { error: 'Failed to get user notification preferences' };
  }
}

// Update notification preferences with enhanced admin options
export async function updateUserNotificationPreferences(
  userId: string,
  preferences: {
    emailNotificationsEnabled: boolean;
    securityAlertsEnabled: boolean;
    // Admin-specific notification options
    adminAlertsEnabled?: boolean;
    systemUpdatesEnabled?: boolean;
    userActivityReportsEnabled?: boolean;
    weeklyDigestEnabled?: boolean;
  },
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

    // Only admin can update other users' preferences
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return { error: 'Insufficient permissions' };
    }

    // Update the notification preferences
    await db
      .update(user)
      .set({
        emailNotificationsEnabled: preferences.emailNotificationsEnabled,
        securityAlertsEnabled: preferences.securityAlertsEnabled,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    // Send notification preference update emails if preferences were changed
    if (
      preferences.emailNotificationsEnabled !== undefined &&
      currentUserData.emailNotificationsEnabled !==
        preferences.emailNotificationsEnabled
    ) {
      await sendNotificationPreferenceUpdateEmail(
        currentUserData.email,
        currentUserData.name,
        'email_notifications',
        preferences.emailNotificationsEnabled,
      );
    }

    if (
      preferences.securityAlertsEnabled !== undefined &&
      currentUserData.securityAlertsEnabled !==
        preferences.securityAlertsEnabled
    ) {
      await sendNotificationPreferenceUpdateEmail(
        currentUserData.email,
        currentUserData.name,
        'security_alerts',
        preferences.securityAlertsEnabled,
      );
    }

    // Revalidate paths
    revalidatePath('/admin/settings');
    revalidatePath('/settings');
    revalidatePath('/profile');

    return { success: true };
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return { error: 'Failed to update notification preferences' };
  }
}

// Test notification functionality (admin only)
export async function sendTestNotification(
  type: 'security' | 'general',
  message: string,
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    // Send test notification based on type
    await sendNotificationIfEnabled(
      normalizeUserForNotifications(currentUser),
      type,
      'test_notification',
      message,
    );

    return { success: true, message: 'Test notification sent successfully' };
  } catch (error) {
    console.error('Send test notification error:', error);
    return { error: 'Failed to send test notification' };
  }
}

// Get notification statistics for admin dashboard
export async function getNotificationStatistics() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    // Get overall notification preferences statistics
    const emailNotificationsStats = await db
      .select({
        enabled: user.emailNotificationsEnabled,
        count: user.id,
      })
      .from(user);

    const securityAlertsStats = await db
      .select({
        enabled: user.securityAlertsEnabled,
        count: user.id,
      })
      .from(user);

    const emailEnabledCount = emailNotificationsStats.filter(
      u => u.enabled,
    ).length;
    const emailDisabledCount = emailNotificationsStats.filter(
      u => !u.enabled,
    ).length;
    const securityEnabledCount = securityAlertsStats.filter(
      u => u.enabled,
    ).length;
    const securityDisabledCount = securityAlertsStats.filter(
      u => !u.enabled,
    ).length;

    return {
      success: true,
      statistics: {
        emailNotifications: {
          enabled: emailEnabledCount,
          disabled: emailDisabledCount,
          total: emailNotificationsStats.length,
        },
        securityAlerts: {
          enabled: securityEnabledCount,
          disabled: securityDisabledCount,
          total: securityAlertsStats.length,
        },
      },
    };
  } catch (error) {
    console.error('Get notification statistics error:', error);
    return { error: 'Failed to get notification statistics' };
  }
}
