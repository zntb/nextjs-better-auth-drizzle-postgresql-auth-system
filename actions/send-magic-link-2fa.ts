'use server';

import { authClient } from '@/lib/auth-client';
import { check2FAAndTrust, verify2FAForMagicLink } from './check-2fa-and-trust';

/**
 * Send magic link with 2FA verification
 */
export async function sendMagicLinkWith2FA(
  email: string,
  name?: string,
  twoFactorCode?: string,
  trustDevice: boolean = false,
) {
  try {
    // First check if 2FA is required
    const twoFAStatus = await check2FAAndTrust(email);

    if (twoFAStatus.requires2FA) {
      // 2FA is required, but no code provided
      if (!twoFactorCode) {
        return {
          requires2FA: true,
          message: 'Two-factor authentication required',
          deviceId: twoFAStatus.deviceId,
          deviceName: twoFAStatus.deviceName,
        };
      }

      // Verify the 2FA code
      const verificationResult = await verify2FAForMagicLink(
        email,
        twoFactorCode,
        twoFAStatus.deviceId!,
        trustDevice,
      );

      if (verificationResult.error) {
        return {
          requires2FA: true,
          error: verificationResult.error,
          deviceId: twoFAStatus.deviceId,
          deviceName: twoFAStatus.deviceName,
        };
      }

      // 2FA verified successfully, proceed with magic link
    }

    // Send the magic link
    const { data, error } = await authClient.signIn.magicLink({
      email,
      name: name || undefined,
      callbackURL: '/profile',
    });

    if (error) {
      return { error: error.message || 'Failed to send magic link' };
    }

    return {
      success: true,
      requires2FA: twoFAStatus.requires2FA,
      message: twoFAStatus.requires2FA
        ? 'Two-factor authentication verified. Check your email for the magic link!'
        : 'Check your email for the magic link to sign in!',
    };
  } catch (error) {
    console.error('Send magic link with 2FA error:', error);
    return { error: 'Failed to send magic link' };
  }
}
