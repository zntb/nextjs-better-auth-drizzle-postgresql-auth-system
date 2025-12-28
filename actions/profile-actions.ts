'use server';

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sendNotificationIfEnabled } from '@/lib/auth/email';
import { normalizeUserForNotifications } from '@/lib/utils';

export async function updateProfile(data: {
  name?: string;
  username?: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Get current user data to check if username is changing
    const currentUserData = await db.query.user.findFirst({
      where: eq(user.id, currentUser.id),
    });

    if (!currentUserData) {
      return { error: 'User not found' };
    }

    // Check if username is already taken
    if (data.username) {
      const existing = await db.query.user.findFirst({
        where: eq(user.username, data.username),
      });

      if (existing && existing.id !== currentUser.id) {
        return { error: 'Username already taken' };
      }
    }

    await db
      .update(user)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(user.id, currentUser.id));

    // Send security notification if username was changed and user has security alerts enabled
    if (data.username && data.username !== currentUserData.username) {
      await sendNotificationIfEnabled(
        normalizeUserForNotifications(currentUser),
        'security',
        'username_changed',
        data.username,
      );
    }

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: 'Failed to update profile' };
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Use Better Auth's changePassword API
    const result = await auth.api.changePassword({
      body: {
        newPassword,
        currentPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    });

    if (!result) {
      return {
        error: 'Current password is incorrect or failed to change password',
      };
    }

    // Send security notification that password has been changed
    await sendNotificationIfEnabled(
      normalizeUserForNotifications(currentUser),
      'security',
      'password_changed',
    );

    return { success: true };
  } catch (error: unknown) {
    console.error('Password change error:', error);

    // Handle specific error messages from Better Auth
    if ((error as Error)?.message?.includes('Invalid password')) {
      return { error: 'Current password is incorrect' };
    }

    if (error instanceof Response && (error as Response)?.status === 401) {
      return { error: 'Current password is incorrect' };
    }

    return { error: 'Failed to change password. Please try again.' };
  }
}
