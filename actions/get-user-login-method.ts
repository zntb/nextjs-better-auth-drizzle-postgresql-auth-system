'use server';

import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

export async function getUserLoginMethod(
  identifier: string,
): Promise<'email' | 'username' | null> {
  try {
    // Determine if identifier looks like an email or username
    const isEmail = identifier.includes('@');

    let userRecord;
    if (isEmail) {
      // Look up by email
      userRecord = await db.query.user.findFirst({
        where: eq(user.email, identifier),
        columns: {
          defaultLoginMethod: true,
        },
      });
    } else {
      // Look up by username
      userRecord = await db.query.user.findFirst({
        where: eq(user.username, identifier),
        columns: {
          defaultLoginMethod: true,
        },
      });
    }

    if (!userRecord) {
      // User not found - return null (don't reveal whether user exists)
      return null;
    }

    return userRecord.defaultLoginMethod as 'email' | 'username';
  } catch (error) {
    console.error('Error getting user login method:', error);
    return null;
  }
}
