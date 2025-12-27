'use client';

import { useState } from 'react';
import { enableTwoFactor, disableTwoFactor } from '@/actions/settings-actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function TwoFactorSettings({ enabled }: { enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isLoading, setIsLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  async function handleToggle() {
    setIsLoading(true);

    if (isEnabled) {
      const result = await disableTwoFactor();
      if (result.success) {
        setIsEnabled(false);
      }
    } else {
      const result = await enableTwoFactor();
      if (result.success && result.backupCodes) {
        setIsEnabled(true);
        setBackupCodes(result.backupCodes);
      }
    }

    setIsLoading(false);
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
          </div>
          <Button onClick={handleToggle} disabled={isLoading}>
            {isEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {backupCodes.length > 0 && (
          <div className='p-4 bg-gray-50 rounded-md'>
            <p className='font-medium mb-2'>Backup Codes</p>
            <p className='text-sm text-gray-600 mb-3'>
              Save these codes in a safe place. Each can be used once.
            </p>
            <div className='grid grid-cols-2 gap-2'>
              {backupCodes.map((code, i) => (
                <code key={i} className='text-sm'>
                  {code}
                </code>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
