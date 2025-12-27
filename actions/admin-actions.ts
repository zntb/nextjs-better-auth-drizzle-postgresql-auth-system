/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';

export async function getAllUsers() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    const users = await db.query.user.findMany();
    return { success: true, users };
  } catch (error) {
    return { error: 'Failed to get users' };
  }
}

export async function blockUser(userId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    await db.update(user).set({ blocked: true }).where(eq(user.id, userId));

    return { success: true };
  } catch (error) {
    return { error: 'Failed to block user' };
  }
}

export async function unblockUser(userId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    await db.update(user).set({ blocked: false }).where(eq(user.id, userId));

    return { success: true };
  } catch (error) {
    return { error: 'Failed to unblock user' };
  }
}

export async function deleteUser(userId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    await db.delete(user).where(eq(user.id, userId));

    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete user' };
  }
}
