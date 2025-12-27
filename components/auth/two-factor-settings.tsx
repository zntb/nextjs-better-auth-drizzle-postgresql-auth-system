'use client';

import { useState } from 'react';
import { enableTwoFactor, disableTwoFactor } from '@/actions/settings-actions';
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
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export function TwoFactorSettings({ enabled }: { enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isLoading, setIsLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  async function handleToggle() {
    if (!isEnabled) {
      // Show password form to enable 2FA
      setShowPasswordForm(true);
      return;
    }

    // For disabling, show password form directly
    setShowPasswordForm(true);
  }

  async function confirmToggle() {
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isEnabled) {
        // Disable 2FA
        const result = await disableTwoFactor(password);
        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
        setIsEnabled(false);
        setBackupCodes([]);
      } else {
        // Enable 2FA
        const result = await enableTwoFactor(password);
        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
        setIsEnabled(true);
        if (result.backupCodes) {
          setBackupCodes(result.backupCodes);
        }
      }

      // Reset form
      setPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  function cancelToggle() {
    setPassword('');
    setShowPasswordForm(false);
    setError('');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='font-medium'>{isEnabled ? 'Enabled' : 'Disabled'}</p>
            {isEnabled && (
              <p className='text-sm text-gray-600 mt-1'>
                Your account is protected with two-factor authentication
              </p>
            )}
          </div>
          <Button
            onClick={handleToggle}
            disabled={isLoading || showPasswordForm}
            variant={isEnabled ? 'destructive' : 'default'}
          >
            {isEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {showPasswordForm && (
          <div className='space-y-4 p-4 border rounded-lg bg-gray-50'>
            <div className='space-y-2'>
              <Label htmlFor='password'>
                Enter your password to {isEnabled ? 'disable' : 'enable'}{' '}
                two-factor authentication
              </Label>
              <div className='relative'>
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder='Enter your password'
                  disabled={isLoading}
                  required
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className='flex space-x-2'>
              <Button
                onClick={confirmToggle}
                disabled={isLoading || !password}
                variant={isEnabled ? 'destructive' : 'default'}
              >
                {isLoading
                  ? 'Processing...'
                  : isEnabled
                  ? 'Disable 2FA'
                  : 'Enable 2FA'}
              </Button>
              <Button
                onClick={cancelToggle}
                variant='outline'
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {backupCodes.length > 0 && (
          <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Important: Save Your Backup Codes</AlertTitle>
              <AlertDescription className='mt-2'>
                These backup codes can be used to access your account if you
                lose access to your authenticator app. Each code can only be
                used once. Store them in a safe place.
              </AlertDescription>
            </Alert>
            <div className='mt-3'>
              <p className='font-medium mb-2 text-sm'>Your backup codes:</p>
              <div className='grid grid-cols-2 gap-2'>
                {backupCodes.map((code, i) => (
                  <code
                    key={i}
                    className='text-sm bg-white px-2 py-1 rounded border'
                  >
                    {code}
                  </code>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
