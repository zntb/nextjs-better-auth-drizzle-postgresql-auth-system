// actions/admin-actions.ts
'use server';

import { db } from '@/lib/db';
import { user, session } from '@/lib/db/schema';
import { eq, or, ilike, sql } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';
import type { InferSelectModel } from 'drizzle-orm';

// Export the User type from the database schema
export type User = InferSelectModel<typeof user>;

export async function getAllUsers() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    const users = await db.query.user.findMany();
    return { success: true, users };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: 'Failed to get users' };
  }
}

export async function getPaginatedUsers({
  page = 1,
  limit = 10,
  search = '',
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { error: 'Unauthorized' };
    }

    const offset = (page - 1) * limit;

    let users;
    let totalCount;

    if (search.trim()) {
      const searchTerm = `%${search.trim()}%`;

      // Search across name, email, and username fields
      users = await db.query.user.findMany({
        where: or(
          ilike(user.name, searchTerm),
          ilike(user.email, searchTerm),
          ilike(user.username, searchTerm),
        ),
        limit,
        offset,
        orderBy: (user, { desc }) => [desc(user.createdAt)],
      });

      // Get total count for search results
      const searchUsers = await db.query.user.findMany({
        where: or(
          ilike(user.name, searchTerm),
          ilike(user.email, searchTerm),
          ilike(user.username, searchTerm),
        ),
      });

      totalCount = searchUsers.length;
    } else {
      users = await db.query.user.findMany({
        limit,
        offset,
        orderBy: (user, { desc }) => [desc(user.createdAt)],
      });

      // Get total count using a simpler approach
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(user);

      totalCount = Number(countResult[0]?.count) || 0;
    }

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      success: true,
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  } catch (error) {
    console.error('Error in getPaginatedUsers:', error);
    return { error: 'Failed to get paginated users' };
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: 'Failed to delete session' };
  }
}
