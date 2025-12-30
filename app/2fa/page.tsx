// app/2fa/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [trustDevice, setTrustDevice] = useState(false);

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
      let result;

      if (code) {
        // TOTP verification
        result = await authClient.twoFactor.verifyTotp({
          code: verificationCode,
          trustDevice,
        });
      } else {
        // Backup code verification
        result = await authClient.twoFactor.verifyBackupCode({
          code: verificationCode,
          trustDevice,
        });
      }

      if (result.error) {
        setError(result.error.message || 'Invalid verification code');
        setIsLoading(false);
        return;
      }

      if (result.data) {
        console.log('✅ 2FA verified successfully');

        // Set a cookie to indicate 2FA is verified for this session
        // This tells middleware to allow access
        await fetch('/api/auth/set-2fa-verified', {
          method: 'POST',
        });

        // Small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirect to home
        console.log('Redirecting to home...');
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('Failed to verify code');
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
                  setBackupCode('');
                }}
                disabled={isLoading}
                maxLength={6}
              />
              <p className='text-xs text-muted-foreground'>
                Enter the code from your authenticator app
              </p>
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
                  setCode('');
                }}
                disabled={isLoading}
              />
              <p className='text-xs text-muted-foreground'>
                Use a backup code if you don't have access to your authenticator
              </p>
            </div>

            {/* Trust Device Checkbox */}
            <div className='flex items-center space-x-2 p-3 border rounded-lg bg-muted/50'>
              <Checkbox
                id='trustDevice'
                checked={trustDevice}
                onCheckedChange={checked => setTrustDevice(checked as boolean)}
                disabled={isLoading}
              />
              <div className='flex-1'>
                <Label
                  htmlFor='trustDevice'
                  className='text-sm font-normal cursor-pointer'
                >
                  Trust this device for 30 days
                </Label>
                <p className='text-xs text-muted-foreground mt-1'>
                  You won't be asked for 2FA on this device during this period
                </p>
              </div>
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
