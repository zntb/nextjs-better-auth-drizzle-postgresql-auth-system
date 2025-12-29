'use client';

import { useEffect, useState } from 'react';
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
import { CheckCircle, XCircle } from 'lucide-react';

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );

  useEffect(() => {
    const handleVerification = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      // Check for error parameters first
      if (error === 'INVALID_TOKEN' || error === 'EXPIRED_TOKEN') {
        setStatus('error');
        return;
      }

      // If there's a token, verify it
      if (token) {
        try {
          const result = await verifyEmail(token);
          if (result.error) {
            setStatus('error');
          } else {
            setStatus('success');
          }
        } catch (error) {
          console.error('Verification error:', error);
          setStatus('error');
        }
      } else {
        // No token and no error - might be a successful verification without token
        // This happens when Better Auth handles the verification automatically
        setStatus('success');
      }
    };

    handleVerification();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing...</CardTitle>
          <CardDescription>
            Please wait while we verify your email address...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-3'>
          {status === 'success' ? (
            <div className='h-12 w-12 rounded-full bg-green-100 flex items-center justify-center'>
              <CheckCircle className='h-6 w-6 text-green-600' />
            </div>
          ) : (
            <div className='h-12 w-12 rounded-full bg-red-100 flex items-center justify-center'>
              <XCircle className='h-6 w-6 text-red-600' />
            </div>
          )}
          <div>
            <CardTitle>
              {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
            </CardTitle>
            <CardDescription>
              {status === 'success'
                ? 'Your email has been successfully verified'
                : 'There was a problem verifying your email'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {status === 'success' ? (
          <>
            <div className='p-4 rounded-lg bg-green-50 border border-green-200'>
              <p className='text-sm text-green-800'>
                Your email address has been verified. You can now sign in to
                your account.
              </p>
            </div>
            <Button onClick={() => router.push('/login')} className='w-full'>
              Continue to Sign In
            </Button>
          </>
        ) : (
          <>
            <div className='p-4 rounded-lg bg-red-50 border border-red-200'>
              <p className='text-sm text-red-800 mb-2'>
                The verification link is invalid or has expired.
              </p>
              <p className='text-xs text-red-700'>
                Please request a new verification email or sign up again.
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                onClick={() => router.push('/register')}
                variant='outline'
                className='flex-1'
              >
                Sign Up Again
              </Button>
              <Button onClick={() => router.push('/login')} className='flex-1'>
                Go to Login
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
