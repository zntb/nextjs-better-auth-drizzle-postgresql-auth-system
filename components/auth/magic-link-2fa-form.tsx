'use client';

import { useState } from 'react';
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
import { AlertCircle, Shield, ArrowLeft } from 'lucide-react';

interface MagicLink2FAFormProps {
  email: string;
  deviceName: string;
  deviceId: string;
  onBack: () => void;
  onSubmit: (code: string, trustDevice: boolean) => Promise<void>;
  isLoading: boolean;
}

export function MagicLink2FAForm({
  email,
  deviceName,
  deviceId,
  onBack,
  onSubmit,
  isLoading,
}: MagicLink2FAFormProps) {
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const verificationCode = code || backupCode;

    if (!verificationCode) {
      setError('Please enter either a verification code or backup code');
      return;
    }

    try {
      await onSubmit(verificationCode, trustDevice);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to verify code',
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2 mb-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={onBack}
            disabled={isLoading}
            className='p-0 h-auto'
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
            <Shield className='w-4 h-4 text-blue-600' />
          </div>
        </div>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          {deviceName !== 'Current Device'
            ? `Verify your identity for ${deviceName}`
            : 'Verify your identity to continue'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md'>
          <p className='text-sm text-blue-800'>
            <strong>{email}</strong>
          </p>
          <p className='text-xs text-blue-600 mt-1'>
            Enter your 2FA code to receive your magic link
          </p>
        </div>

        {error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
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
                setCode(''); // Clear regular code when backup code is entered
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
            {isLoading ? 'Verifying...' : 'Verify & Send Magic Link'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
