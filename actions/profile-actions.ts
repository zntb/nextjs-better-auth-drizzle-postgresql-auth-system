'use server';

import { db } from '@/lib/db';
import { user, account } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';
import { auth } from '@/lib/auth';
import { hash, verify } from '@node-rs/argon2';

export async function updateProfile(data: {
  name?: string;
  username?: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
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

    // Get the user's account with password
    const userAccount = await db.query.account.findFirst({
      where: and(
        eq(account.userId, currentUser.id),
        eq(account.providerId, 'email'),
      ),
    });

    if (!userAccount || !userAccount.password) {
      return { error: 'No password account found' };
    }

    // Verify current password
    const isCurrentPasswordValid = await verify(
      userAccount.password,
      currentPassword,
      {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      },
    );

    if (!isCurrentPasswordValid) {
      return { error: 'Current password is incorrect' };
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Update password in account table
    await db
      .update(account)
      .set({
        password: hashedNewPassword,
        updatedAt: new Date(),
      })
      .where(eq(account.id, userAccount.id));

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error('Password change error:', error);
    return { error: 'Failed to change password' };
  }
}
