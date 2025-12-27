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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Check if user just verified their email
  const justVerified = searchParams.get('verified') === 'true';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setNeedsVerification(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setUserEmail(email);

    try {
      const result = await signIn.email(
        {
          email,
          password,
        },
        {
          onError: ctx => {
            setIsLoading(false);
            if (ctx.error.status === 403) {
              // User hasn't verified their email
              setNeedsVerification(true);
              setError('Please verify your email address before signing in.');
            } else {
              setError(ctx.error.message || 'Invalid credentials');
            }
          },
          onSuccess: ctx => {
            // Check if 2FA is required
            if (ctx.data?.twoFactorRedirect) {
              // DO NOT redirect here - let onTwoFactorRedirect handle it
              // The global callback will handle the redirect to /2fa
              console.log('2FA required, redirecting...');
              return;
            }
            // Only redirect to home if 2FA is NOT required
            setIsLoading(false);
            router.push('/');
            router.refresh();
          },
        },
      );

      // If we get here and result has twoFactorRedirect, the onTwoFactorRedirect should handle it
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - checking for twoFactorRedirect
      if (result?.data?.twoFactorRedirect) {
        // Let the global onTwoFactorRedirect callback handle the redirect
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected error occurred');
    }
  }

  async function resendVerification() {
    setIsLoading(true);
    try {
      await authClient.sendVerificationEmail({
        email: userEmail,
        callbackURL: '/verify',
      });
      setVerificationSent(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {justVerified && (
          <Alert className='mb-4'>
            <CheckCircle className='h-4 w-4' />
            <AlertTitle>Email Verified!</AlertTitle>
            <AlertDescription>
              Your email has been verified. You can now sign in to your account.
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
  );
}
