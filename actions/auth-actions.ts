'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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

export async function checkEmailExists(email: string) {
  try {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });
    return existingUser ? true : false;
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false;
  }
}

export async function createUserWithEmail({
  email,
  password,
  name,
  username,
  displayUsername,
}: {
  email: string;
  password: string;
  name: string;
  username?: string;
  displayUsername?: string;
}) {
  try {
    // First check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return { error: 'An account with this email address already exists' };
    }

    // Check if username already exists if provided
    if (username) {
      const existingUsername = await db.query.user.findFirst({
        where: eq(user.username, username),
      });
      if (existingUsername) {
        return { error: 'This username is already taken' };
      }
    }

    // Try to create the account
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        username: username || undefined,
        displayUsername: displayUsername || undefined,
        callbackURL: '/verify', // Redirect to verify page after email verification
      },
    });

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('Signup error:', error);

    // Check for specific error patterns
    const errorMessage =
      (error as { message?: string })?.message?.toLowerCase() || '';

    if (errorMessage.includes('unique') || errorMessage.includes('duplicate')) {
      if (errorMessage.includes('email')) {
        return { error: 'An account with this email address already exists' };
      }
      if (errorMessage.includes('username')) {
        return { error: 'This username is already taken' };
      }
    }

    if (errorMessage.includes('email')) {
      return { error: 'An account with this email address already exists' };
    }

    return {
      error:
        (error as { message?: string })?.message ||
        'Failed to create account. Please try again.',
    };
  }
}
