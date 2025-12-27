'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Shield } from 'lucide-react';

export default function TwoFAPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const verificationCode = code || backupCode;

    if (!verificationCode) {
      setError('Please enter either a verification code or backup code');
      setIsLoading(false);
      return;
    }

    try {
      // Try TOTP verification first
      const { data, error: verifyError } =
        await authClient.twoFactor.verifyTotp({
          code: verificationCode,
          trustDevice: true,
        });

      if (verifyError) {
        setError(verifyError.message || 'Invalid verification code');
        setIsLoading(false);
        return;
      }

      if (data) {
        // 2FA verified successfully, redirect to home
        router.push('/');
        router.refresh();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
            <Shield className='w-6 h-6 text-blue-600' />
          </div>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter your verification code or backup code to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='code'>Verification Code</Label>
              <Input
                id='code'
                name='code'
                type='text'
                placeholder='Enter 6-digit code'
                value={code}
                onChange={e => {
                  setCode(e.target.value);
                  setBackupCode(''); // Clear backup code when regular code is entered
                }}
                disabled={isLoading}
                maxLength={6}
              />
            </div>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-white px-2 text-muted-foreground'>Or</span>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='backupCode'>Backup Code</Label>
              <Input
                id='backupCode'
                name='backupCode'
                type='text'
                placeholder='Enter backup code'
                value={backupCode}
                onChange={e => {
                  setBackupCode(e.target.value);
                  setCode(''); // Clear regular code when backup code is entered
                }}
                disabled={isLoading}
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
