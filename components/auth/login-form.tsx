/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Replace your current login-form.tsx with this temporarily for debugging

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  // Check if user just verified their email
  const justVerified = searchParams.get('verified') === 'true';

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLog(prev => [...prev, logMessage]);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setNeedsVerification(false);
    setDebugLog([]);

    addLog('🔵 Login attempt started');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setUserEmail(email);
    addLog(`📧 Email: ${email}`);

    try {
      addLog('🔄 Calling signIn.email...');

      const result = await signIn.email(
        {
          email,
          password,
        },
        {
          onRequest: () => {
            addLog('📤 Request sent to server');
          },
          onError: ctx => {
            addLog(
              `❌ Error received: ${JSON.stringify({
                status: ctx.error.status,
                message: ctx.error.message,
              })}`,
            );

            setIsLoading(false);
            if (ctx.error.status === 403) {
              setNeedsVerification(true);
              setError('Please verify your email address before signing in.');
              addLog('📧 Email verification required');
            } else {
              setError(ctx.error.message || 'Invalid credentials');
            }
          },
          onSuccess: ctx => {
            addLog(`✅ Success callback triggered`);
            addLog(
              `📊 Response data: ${JSON.stringify({
                hasTwoFactorRedirect: 'twoFactorRedirect' in (ctx.data || {}),
                twoFactorRedirectValue: (ctx.data as any)?.twoFactorRedirect,
                sessionExists: !!ctx.data?.session,
                userExists: !!ctx.data?.user,
              })}`,
            );

            // Check if 2FA is required
            if ((ctx.data as any)?.twoFactorRedirect) {
              addLog('🔐 2FA REDIRECT DETECTED - Should redirect to /2fa');
              addLog('⏳ Waiting for onTwoFactorRedirect callback...');
              // The global onTwoFactorRedirect callback should handle the redirect
              return;
            }

            addLog('✓ No 2FA required, redirecting to home');
            setIsLoading(false);
            router.push('/');
            router.refresh();
          },
        },
      );

      addLog(
        `📦 Result received: ${JSON.stringify({
          hasData: !!result?.data,
          hasError: !!result?.error,
          hasTwoFactorRedirect: !!(result?.data as any)?.twoFactorRedirect,
        })}`,
      );

      // Additional check
      if ((result?.data as any)?.twoFactorRedirect) {
        addLog('🔐 2FA redirect flag in result (backup check)');
      } else {
        addLog('ℹ️ No 2FA redirect flag in result');
      }
    } catch (err) {
      addLog(`💥 Exception caught: ${err}`);
      setIsLoading(false);
      setError('An unexpected error occurred');
    }
  }

  async function resendVerification() {
    setIsLoading(true);
    addLog('📨 Resending verification email...');
    try {
      await authClient.sendVerificationEmail({
        email: userEmail,
        callbackURL: '/verify',
      });
      setVerificationSent(true);
      addLog('✅ Verification email sent');
    } catch (err) {
      addLog(`❌ Failed to send verification: ${err}`);
      setError('Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Sign In (Debug Mode)</CardTitle>
          <CardDescription>
            Enhanced logging enabled - check console and below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {justVerified && (
            <Alert className='mb-4'>
              <CheckCircle className='h-4 w-4' />
              <AlertTitle>Email Verified!</AlertTitle>
              <AlertDescription>
                Your email has been verified. You can now sign in to your
                account.
              </AlertDescription>
            </Alert>
          )}

          {verificationSent && (
            <Alert className='mb-4'>
              <CheckCircle className='h-4 w-4' />
              <AlertTitle>Verification Email Sent</AlertTitle>
              <AlertDescription>
                Please check your email inbox for the verification link.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {needsVerification && !verificationSent && (
              <div className='p-4 border border-yellow-200 bg-yellow-50 rounded-lg space-y-3'>
                <p className='text-sm text-yellow-800'>
                  Your email address hasn&apos;t been verified yet.
                </p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={resendVerification}
                  disabled={isLoading}
                >
                  Resend Verification Email
                </Button>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='email'>Email or Username</Label>
              <Input
                id='email'
                name='email'
                type='text'
                placeholder='email@example.com'
                required
                disabled={isLoading}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                required
                disabled={isLoading}
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Debug Log */}
      {debugLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Debug Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={debugLog.join('\n')}
              readOnly
              className='font-mono text-xs h-64'
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
