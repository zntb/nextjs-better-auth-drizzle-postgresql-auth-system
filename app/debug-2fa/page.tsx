/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';

// Create this page at: app/debug-2fa/page.tsx

export default function Debug2FAPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadDebugInfo = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { debug2FA } = await import('@/actions/debug-2fa-action');
      const result = await debug2FA();
      if (result.success) {
        setDebugInfo(result.debug);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error loading debug info: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearDevices = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { clearTrustedDevices } = await import(
        '@/actions/debug-2fa-action'
      );
      const result = await clearTrustedDevices();
      if (result.success) {
        setMessage('✓ All trusted devices cleared');
        loadDebugInfo();
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const force2FAOn = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { force2FAStatus } = await import('@/actions/debug-2fa-action');
      const result = await force2FAStatus(true);
      if (result.success) {
        setMessage('✓ 2FA forced ON in database');
        loadDebugInfo();
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const force2FAOff = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { force2FAStatus } = await import('@/actions/debug-2fa-action');
      const result = await force2FAStatus(false);
      if (result.success) {
        setMessage('✓ 2FA forced OFF in database');
        loadDebugInfo();
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearTrustCookie = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { clearTrustDeviceCookie } = await import(
        '@/actions/clear-trust-cookie'
      );
      const result = await clearTrustDeviceCookie();
      if (result.success) {
        setMessage(
          '✓ Trust device cookie cleared! Now log out and try logging in again.',
        );
        loadDebugInfo();
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebugInfo();
  }, []);

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>2FA Debug Console</h1>
          <p className='text-muted-foreground'>
            Diagnose 2FA issues and see the current state
          </p>
        </div>

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className='flex gap-2 flex-wrap'>
          <Button onClick={loadDebugInfo} disabled={loading}>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Button onClick={clearDevices} variant='outline' disabled={loading}>
            <Trash2 className='h-4 w-4 mr-2' />
            Clear Trusted Devices
          </Button>
          <Button
            onClick={clearTrustCookie}
            variant='destructive'
            disabled={loading}
          >
            <Trash2 className='h-4 w-4 mr-2' />
            Clear Trust Cookie
          </Button>
          <Button onClick={force2FAOn} variant='outline' disabled={loading}>
            Force 2FA ON
          </Button>
          <Button onClick={force2FAOff} variant='outline' disabled={loading}>
            Force 2FA OFF
          </Button>
        </div>

        {debugInfo && (
          <>
            {/* Overall Status */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Status</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <StatusRow
                  label='2FA Ready'
                  value={debugInfo.ready2FA}
                  description='2FA is fully configured and should work'
                />
                <StatusRow
                  label='Session Matches Database'
                  value={debugInfo.sessionMatchesDb}
                  description='Session and database are in sync'
                />
              </CardContent>
            </Card>

            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <InfoRow label='User ID' value={debugInfo.userId} />
                <InfoRow label='Email' value={debugInfo.userEmail} />
              </CardContent>
            </Card>

            {/* 2FA State */}
            <Card>
              <CardHeader>
                <CardTitle>2FA State</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <StatusRow
                  label='Session: 2FA Enabled'
                  value={debugInfo.sessionTwoFactorEnabled}
                />
                <StatusRow
                  label='Database: 2FA Enabled'
                  value={debugInfo.dbTwoFactorEnabled}
                />
                <StatusRow
                  label='Has 2FA Record'
                  value={debugInfo.has2FARecord}
                />
                <StatusRow label='Has Secret' value={debugInfo.hasSecret} />
                {debugInfo.hasSecret && (
                  <InfoRow
                    label='Secret Length'
                    value={debugInfo.secretLength}
                  />
                )}
                <StatusRow
                  label='Has Backup Codes'
                  value={debugInfo.hasBackupCodes}
                />
              </CardContent>
            </Card>

            {/* Trusted Devices */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Trusted Devices ({debugInfo.trustedDeviceCount})
                </CardTitle>
                <CardDescription>
                  Devices that bypass 2FA verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                {debugInfo.trustedDeviceCount === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    No trusted devices
                  </p>
                ) : (
                  <div className='space-y-2'>
                    {debugInfo.trustedDevices.map((device: any) => (
                      <div key={device.id} className='p-3 border rounded-lg'>
                        <div className='font-medium'>{device.deviceName}</div>
                        <div className='text-sm text-muted-foreground'>
                          Last used:{' '}
                          {new Date(device.lastUsed).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>Relevant Cookies</CardTitle>
                <CardDescription>
                  Auth-related cookies in the browser
                </CardDescription>
              </CardHeader>
              <CardContent>
                {debugInfo.relevantCookies.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    No relevant cookies found
                  </p>
                ) : (
                  <div className='space-y-1'>
                    {debugInfo.relevantCookies.map((cookie: any) => (
                      <div
                        key={cookie.name}
                        className='flex items-center gap-2'
                      >
                        <code className='text-xs'>{cookie.name}</code>
                        {cookie.hasValue && (
                          <Badge variant='secondary' className='text-xs'>
                            has value
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Diagnosis */}
            <Card className='border-yellow-500'>
              <CardHeader>
                <CardTitle>Diagnosis & Recommendations</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {/* Check for trust device cookie */}
                {debugInfo.relevantCookies.some(
                  (c: any) => c.name === 'better-auth.trust_device',
                ) && (
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>
                      <strong>🔴 FOUND THE PROBLEM!</strong>
                      <p className='mt-2'>
                        You have a <code>better-auth.trust_device</code> cookie
                        that&apos;s bypassing 2FA. This is why 2FA isn&apos;t
                        being asked for during login.
                      </p>
                      <p className='mt-2 font-bold'>
                        Solution: Click the &quot;Clear Trust Cookie&quot;
                        button above, then log out and log in again.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {!debugInfo.ready2FA && (
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>
                      <strong>2FA is NOT ready.</strong> Issues detected:
                      <ul className='list-disc ml-4 mt-2'>
                        {!debugInfo.has2FARecord && (
                          <li>No 2FA record in database</li>
                        )}
                        {!debugInfo.hasSecret && <li>No secret stored</li>}
                        {!debugInfo.dbTwoFactorEnabled && (
                          <li>2FA not enabled in database</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {debugInfo.ready2FA && debugInfo.trustedDeviceCount > 0 && (
                  <Alert>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>
                      <strong>You have trusted devices.</strong> This might be
                      why 2FA is being skipped. Click &quot;Clear Trusted
                      Devices&quot; above to test.
                    </AlertDescription>
                  </Alert>
                )}

                {debugInfo.ready2FA && !debugInfo.sessionMatchesDb && (
                  <Alert>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>
                      <strong>Session out of sync.</strong> Try logging out and
                      back in.
                    </AlertDescription>
                  </Alert>
                )}

                {debugInfo.ready2FA &&
                  debugInfo.sessionMatchesDb &&
                  debugInfo.trustedDeviceCount === 0 &&
                  !debugInfo.relevantCookies.some(
                    (c: any) => c.name === 'better-auth.trust_device',
                  ) && (
                    <Alert>
                      <CheckCircle className='h-4 w-4' />
                      <AlertDescription>
                        <strong>Everything looks correct!</strong> If 2FA still
                        doesn&apos;t work:
                        <ul className='list-disc ml-4 mt-2'>
                          <li>Check browser console for errors during login</li>
                          <li>
                            Check Network tab for the sign-in API response
                          </li>
                          <li>
                            Verify NEXT_PUBLIC_BETTER_AUTH_URL is set correctly
                          </li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  description,
}: {
  label: string;
  value: boolean;
  description?: string;
}) {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <div className='font-medium'>{label}</div>
        {description && (
          <div className='text-sm text-muted-foreground'>{description}</div>
        )}
      </div>
      {value ? (
        <Badge className='bg-green-500'>
          <CheckCircle className='h-3 w-3 mr-1' />
          Yes
        </Badge>
      ) : (
        <Badge variant='destructive'>
          <AlertCircle className='h-3 w-3 mr-1' />
          No
        </Badge>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className='flex items-center justify-between'>
      <div className='font-medium text-sm'>{label}</div>
      <code className='text-sm'>{String(value)}</code>
    </div>
  );
}
