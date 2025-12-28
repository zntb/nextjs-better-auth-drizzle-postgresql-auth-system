'use client';

import { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { authClient } from '@/lib/auth-client';
import { sendMagicLinkWith2FA } from '@/actions/send-magic-link-2fa';
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
import { MagicLink2FAForm } from './magic-link-2fa-form';

export function MagicLinkForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingName, setPendingName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    try {
      // Use the new 2FA-aware magic link function
      const result = await sendMagicLinkWith2FA(email, name);

      if (result.error) {
        setError(result.error);
      } else if (result.requires2FA) {
        // 2FA is required, show verification form
        setShow2FA(true);
        setPendingEmail(email);
        setPendingName(name);
        setDeviceId(result.deviceId || '');
        setDeviceName(result.deviceName || 'Current Device');
        setError('');
      } else {
        // No 2FA required, show success
        setSuccess(true);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  }

  async function on2FASubmit(code: string, trustDevice: boolean) {
    setIsLoading(true);
    setError('');

    try {
      const result = await sendMagicLinkWith2FA(
        pendingEmail,
        pendingName,
        code,
        trustDevice,
      );

      if (result.error) {
        setError(result.error);
      } else {
        setShow2FA(false);
        setSuccess(true);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  }

  function on2FABack() {
    setShow2FA(false);
    setPendingEmail('');
    setPendingName('');
    setDeviceId('');
    setDeviceName('');
    setError('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Magic Link</CardTitle>
        <CardDescription>
          Sign in with a magic link sent to your email
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className='p-4 text-sm text-green-700 bg-green-50 rounded-md'>
            Check your email for a magic link to sign in!
          </div>
        ) : show2FA ? (
          <MagicLink2FAForm
            email={pendingEmail}
            deviceName={deviceName}
            deviceId={deviceId}
            onBack={on2FABack}
            onSubmit={on2FASubmit}
            isLoading={isLoading}
          />
        ) : (
          <form onSubmit={onSubmit} className='space-y-4'>
            {error && (
              <div className='p-3 text-sm text-red-500 bg-red-50 rounded-md'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='email@example.com'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='name'>Name (optional)</Label>
              <Input
                id='name'
                name='name'
                type='text'
                placeholder='Your name'
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
