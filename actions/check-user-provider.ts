// actions/check-user-provider.ts
'use server';

import { db } from '@/lib/db';
import { account } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';

/**
 * Check if user has credential-based authentication
 * Returns true if user has email/password auth, false if only OAuth
 */
export async function hasCredentialAuth() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Get all accounts for this user
    const userAccounts = await db.query.account.findMany({
      where: eq(account.userId, currentUser.id),
    });

    // Check if any account has 'credential' as provider
    const hasCredentials = userAccounts.some(
      acc => acc.providerId === 'credential',
    );

    // Get list of OAuth providers
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
 * Check if user can enable 2FA
 * OAuth-only users cannot enable 2FA
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
      message: `Your account uses ${result.oauthProviders?.join(
        ', ',
      )} for authentication. Two-factor authentication is managed by your provider and cannot be enabled here.`,
      providers: result.oauthProviders,
    };
  }

  return {
    success: true,
    canEnable: true,
    message: 'You can enable two-factor authentication for your account.',
  };
}
