'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState('');

  const handleVerification = useCallback(async () => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    try {
      const result = await verifyEmail(token);

      if (result.error) {
        setStatus('error');
        setMessage(result.error);
      } else {
        setStatus('success');
        setMessage(
          'Email verified successfully! You can now sign in to your account.',
        );
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Failed to verify email');
    }
  }, [searchParams, router]);

  // Call verification on component mount
  handleVerification();

  if (status === 'loading') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verifying Email</CardTitle>
          <CardDescription>
            Please wait while we verify your email address...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {status === 'success' ? 'Email Verified' : 'Verification Failed'}
        </CardTitle>
        <CardDescription>
          {status === 'success'
            ? 'Your email has been successfully verified'
            : 'There was a problem verifying your email'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div
          className={`p-3 rounded-md text-sm ${
            status === 'success'
              ? 'text-green-700 bg-green-50'
              : 'text-red-700 bg-red-50'
          }`}
        >
          {message}
        </div>

        {status === 'error' && (
          <div className='space-y-2'>
            <p className='text-sm text-gray-600'>
              The verification link may have expired or is invalid.
            </p>
            <div className='flex gap-2'>
              <Button
                onClick={() => router.push('/register')}
                variant='outline'
              >
                Sign Up Again
              </Button>
              <Button onClick={() => router.push('/login')}>Go to Login</Button>
            </div>
          </div>
        )}

        {status === 'success' && (
          <Button onClick={() => router.push('/login')} className='w-full'>
            Continue to Sign In
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
