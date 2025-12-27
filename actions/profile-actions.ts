'use server';

import { db } from '@/lib/db';
import { user, account } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from './auth-actions';
import { hash, verify } from '@node-rs/argon2';

interface VerifyError {
  code?: string;
  message?: string;
}

// Utility function to check if a password hash is valid
function isValidPasswordHash(passwordHash: string): boolean {
  // Basic validation: argon2 hashes should start with specific prefixes
  // and have a reasonable length
  const argon2Prefixes = ['$argon2id$', '$argon2i$', '$argon2d$'];
  const hasValidPrefix = argon2Prefixes.some(prefix =>
    passwordHash.startsWith(prefix),
  );
  const hasValidLength = passwordHash.length > 50; // Minimum length for valid argon2 hash

  return hasValidPrefix && hasValidLength;
}

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

    console.log('Current user:', currentUser.id);

    // Get all accounts for the user
    const userAccounts = await db.query.account.findMany({
      where: eq(account.userId, currentUser.id),
    });

    console.log('Found accounts:', userAccounts.length);

    // Find account with password (could be any provider)
    const userAccount = userAccounts.find(acc => acc.password);

    if (!userAccount) {
      console.log('No password account found for user:', currentUser.id);
      console.log(
        'Available accounts:',
        userAccounts.map(acc => ({
          id: acc.id,
          providerId: acc.providerId,
          hasPassword: !!acc.password,
        })),
      );
      return {
        error:
          'No password account found. You may have signed up with a social provider.',
      };
    }

    console.log(
      'Using account:',
      userAccount.id,
      'provider:',
      userAccount.providerId,
    );

    // Verify current password
    if (!userAccount.password) {
      return { error: 'Password data not found' };
    }

    let isCurrentPasswordValid = false;

    try {
      // First check if the hash format is valid
      if (!isValidPasswordHash(userAccount.password)) {
        console.log(
          'Invalid password hash format detected for user:',
          currentUser.id,
        );
        return {
          error:
            'Your password data appears to be corrupted. Please reset your password using the "Forgot Password" link on the login page.',
        };
      }

      isCurrentPasswordValid = await verify(
        userAccount.password,
        currentPassword,
        {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        },
      );
    } catch (verifyError: unknown) {
      console.log('Password verification failed:', verifyError);

      // Check if it's a malformed hash error
      const errorMessage =
        verifyError instanceof Error ? verifyError.message : '';
      const errorCode = (verifyError as VerifyError)?.code;

      if (
        errorMessage?.includes('missing field') ||
        errorCode === 'InvalidArg'
      ) {
        console.log(
          'Detected malformed password hash for user:',
          currentUser.id,
        );

        // The password hash is corrupted/malformed
        // User needs to reset their password
        return {
          error:
            'Your password data appears to be corrupted. Please reset your password using the "Forgot Password" link on the login page.',
        };
      }

      // For other types of errors, be generic for security
      return {
        error:
          'Unable to verify current password. Please try resetting your password instead.',
      };
    }

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

    console.log('Password updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Password change error:', error);
    return { error: 'Failed to change password' };
  }
}

// Admin function to check for corrupted password hashes
export async function checkCorruptedPasswords() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Check if user is admin
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, currentUser.id),
    });

    if (!userRecord || userRecord.role !== 'admin') {
      return { error: 'Admin access required' };
    }

    // Get all accounts with passwords
    const accountsWithPasswords = await db.query.account.findMany({});

    // Filter to only accounts that have passwords
    const accountsWithActualPasswords = accountsWithPasswords.filter(
      acc => acc.password,
    );

    const corruptedPasswords = [];

    for (const acc of accountsWithActualPasswords) {
      if (acc.password && !isValidPasswordHash(acc.password)) {
        corruptedPasswords.push({
          accountId: acc.id,
          userId: acc.userId,
          providerId: acc.providerId,
          passwordLength: acc.password.length,
          passwordPreview: acc.password.substring(0, 20) + '...',
        });
      }
    }

    return {
      success: true,
      totalAccounts: accountsWithActualPasswords.length,
      corruptedPasswords,
    };
  } catch (error) {
    console.error('Check corrupted passwords error:', error);
    return { error: 'Failed to check corrupted passwords' };
  }
}

// Admin function to clear corrupted password hashes
export async function clearCorruptedPasswords() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Unauthorized' };
    }

    // Check if user is admin
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, currentUser.id),
    });

    if (!userRecord || userRecord.role !== 'admin') {
      return { error: 'Admin access required' };
    }

    // Get all accounts with passwords
    const accountsWithPasswords = await db.query.account.findMany({});

    // Filter to only accounts that have passwords
    const accountsWithActualPasswords = accountsWithPasswords.filter(
      acc => acc.password,
    );

    let clearedCount = 0;

    for (const acc of accountsWithActualPasswords) {
      if (acc.password && !isValidPasswordHash(acc.password)) {
        await db
          .update(account)
          .set({
            password: null,
            updatedAt: new Date(),
          })
          .where(eq(account.id, acc.id));
        clearedCount++;
      }
    }

    return {
      success: true,
      message: `Cleared ${clearedCount} corrupted password hashes`,
    };
  } catch (error) {
    console.error('Clear corrupted passwords error:', error);
    return { error: 'Failed to clear corrupted passwords' };
  }
}
