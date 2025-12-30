// actions/add-password-for-oauth.ts
'use server';

import { db } from '@/lib/db';
import { account } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Check if user has credential-based authentication
 */
export async function hasCredentialAuth() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    const userAccounts = await db.query.account.findMany({
      where: eq(account.userId, currentUser.id),
    });

    const hasCredentials = userAccounts.some(
      acc => acc.providerId === 'credential',
    );

    const oauthProviders = userAccounts
      .filter(acc => acc.providerId !== 'credential')
      .map(acc => acc.providerId);

    return {
      success: true,
      hasCredentials,
      oauthProviders,
      hasOnlyOAuth: !hasCredentials && oauthProviders.length > 0,
    };
  } catch (error) {
    console.error('Check credential auth error:', error);
    return { error: 'Failed to check authentication method' };
  }
}

/**
 * Add password to an existing OAuth account
 * This allows OAuth users to enable 2FA
 */
export async function addPasswordToOAuthAccount(password: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Check if user already has credentials
    const authCheck = await hasCredentialAuth();
    if (authCheck.hasCredentials) {
      return { error: 'You already have password authentication enabled' };
    }

    if (!authCheck.hasOnlyOAuth) {
      return { error: 'This feature is only available for OAuth accounts' };
    }

    // Validate password strength
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long' };
    }

    // Use Better Auth to set password
    // This creates a credential account linked to the existing OAuth account
    const result = await auth.api.setPassword({
      body: {
        newPassword: password,
      },
      headers: await headers(),
    });

    if (!result) {
      return { error: 'Failed to add password authentication' };
    }

    return {
      success: true,
      message:
        'Password authentication added successfully! You can now enable 2FA.',
    };
  } catch (error) {
    console.error('Add password error:', error);
    if (error instanceof Error) {
      // Check for specific error messages
      if (error.message.includes('already has a password')) {
        return { error: 'You already have password authentication enabled' };
      }
    }
    return { error: 'Failed to add password authentication' };
  }
}

/**
 * Check if user can enable 2FA
 */
export async function canEnable2FA() {
  const result = await hasCredentialAuth();

  if (result.error) {
    return { error: result.error };
  }

  if (result.hasOnlyOAuth) {
    return {
      success: false,
      canEnable: false,
      needsPassword: true,
      message: `Your account uses ${result.oauthProviders?.join(
        ', ',
      )} for authentication. Add password authentication to enable 2FA.`,
      providers: result.oauthProviders,
    };
  }

  return {
    success: true,
    canEnable: true,
    needsPassword: false,
    message: 'You can enable two-factor authentication for your account.',
  };
}
