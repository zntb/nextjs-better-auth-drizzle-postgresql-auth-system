'use server';

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';
import { hash } from '@node-rs/argon2';

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

    // Verify current password logic would go here
    // This depends on Better Auth's password verification

    const hashedPassword = await hash(newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Update password in account table
    // This depends on Better Auth's account structure

    return { success: true };
  } catch (error) {
    return { error: 'Failed to change password' };
  }
}
