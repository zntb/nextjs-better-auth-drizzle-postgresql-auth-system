'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function verifyEmail(token: string) {
  try {
    const result = await auth.api.verifyEmail({
      query: {
        token,
      },
    });

    if (!result) {
      return { error: 'Invalid or expired token' };
    }

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { error: 'Failed to verify email' };
  }
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return session.user;
}
