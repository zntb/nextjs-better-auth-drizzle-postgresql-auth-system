/* eslint-disable @typescript-eslint/no-unused-vars */
// actions/admin-actions.ts
'use server';

import { db } from '@/lib/db';
import { user, session } from '@/lib/db/schema';
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

export async function banUser(userId: string, reason: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    await db
      .update(user)
      .set({
        banned: true,
        banReason: reason,
        banExpires: null, // Permanent ban for now
      })
      .where(eq(user.id, userId));

    return { success: true };
  } catch (error) {
    return { error: 'Failed to ban user' };
  }
}

export async function unbanUser(userId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    await db
      .update(user)
      .set({
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .where(eq(user.id, userId));

    return { success: true };
  } catch (error) {
    return { error: 'Failed to unban user' };
  }
}

export async function deleteSession(sessionId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    await db.delete(session).where(eq(session.id, sessionId));

    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete session' };
  }
}
