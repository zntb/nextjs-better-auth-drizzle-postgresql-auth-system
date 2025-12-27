/* eslint-disable @typescript-eslint/no-unused-vars */
// app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle,
  Shield,
  Key,
  Bell,
  Palette,
  Monitor,
  Trash2,
  Download,
  Upload,
  Eye,
  Unlock,
  QrCode,
  Copy,
} from 'lucide-react';
import { ChangePasswordForm } from '@/components/auth/change-password-form';
import {
  toggleEmailPassword,
  enableTwoFactor,
  disableTwoFactor,
  getTrustedDevices,
  removeTrustedDevice,
  deleteAccount,
} from '@/actions/settings-actions';

interface TrustedDevice {
  id: string;
  deviceName: string;
  deviceType: string;
  location: string;
  lastUsed: string;
  isCurrentDevice: boolean;
}

interface DeviceData {
  id: string;
  deviceName?: string;
  deviceType?: string;
  location?: string;
  lastUsed?: string;
  isCurrentDevice?: boolean;
  [key: string]: unknown;
}

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  twoFactorEnabled?: boolean | null;
  emailPasswordEnabled?: boolean | null;
  [key: string]: unknown;
}

interface SettingsState {
  emailPasswordEnabled: boolean;
  twoFactorEnabled: boolean;
  trustedDevices: TrustedDevice[];
  notifications: {
    email: boolean;
    push: boolean;
    security: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showActivity: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
}

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Settings state
  const [settings, setSettings] = useState<SettingsState>({
    emailPasswordEnabled: true,
    twoFactorEnabled: false,
    trustedDevices: [],
    notifications: {
      email: true,
      push: true,
      security: true,
      marketing: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showActivity: true,
    },
    appearance: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
    },
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      setSettings(prev => ({
        ...prev,
        emailPasswordEnabled:
          (session.user as ExtendedUser).emailPasswordEnabled ?? true,
        twoFactorEnabled: session.user.twoFactorEnabled || false,
      }));
      loadTrustedDevices();
    }
  }, [session, isPending, router]);

  // Handle navigation to security section
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#security') {
      const securityElement = document.getElementById('security-section');
      if (securityElement) {
        securityElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [isPending]);

  const loadTrustedDevices = async () => {
    try {
      const result = await getTrustedDevices();
      if (result.success && result.devices) {
        setSettings(prev => ({
          ...prev,
          trustedDevices: result.devices.map((device: unknown) => {
            const deviceData = device as DeviceData;
            return {
              id: deviceData.id,
              deviceName: deviceData.deviceName || 'Unknown Device',
              deviceType: deviceData.deviceType || 'Desktop',
              location: deviceData.location || 'Unknown Location',
              lastUsed: deviceData.lastUsed
                ? new Date(deviceData.lastUsed).toLocaleDateString()
                : 'Unknown',
              isCurrentDevice: deviceData.isCurrentDevice || false,
            };
          }),
        }));
      }
    } catch (error) {
      console.error('Failed to load trusted devices:', error);
    }
  };

  const handleToggleEmailPassword = async (enabled: boolean) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await toggleEmailPassword(enabled);
      if (result.error) {
        setError(result.error);
      } else {
        setSettings(prev => ({ ...prev, emailPasswordEnabled: enabled }));
        setSuccess(`Password login ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (err) {
      setError('Failed to update password setting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    if (settings.twoFactorEnabled) {
      // Disable 2FA
      setIsLoading(true);
      setError('');
      setSuccess('');

      try {
        const result = await disableTwoFactor();
        if (result.error) {
          setError(result.error);
        } else {
          setSettings(prev => ({ ...prev, twoFactorEnabled: false }));
          setSuccess('Two-factor authentication disabled');
        }
      } catch (err) {
        setError('Failed to disable 2FA');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Show 2FA setup dialog
      setShow2FADialog(true);
    }
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await enableTwoFactor();
      if (result.error) {
        setError(result.error);
      } else {
        setQrCode(result.secret || '');
        setBackupCodes(result.backupCodes || []);
        setSettings(prev => ({ ...prev, twoFactorEnabled: true }));
        setSuccess('Two-factor authentication enabled');
        setShow2FADialog(false);
      }
    } catch (err) {
      setError('Failed to enable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    setIsLoading(true);
    try {
      const result = await removeTrustedDevice(deviceId);
      if (result.success) {
        setSettings(prev => ({
          ...prev,
          trustedDevices: prev.trustedDevices.filter(d => d.id !== deviceId),
        }));
        setSuccess('Device removed');
      } else {
        setError('Failed to remove device');
      }
    } catch (err) {
      setError('Failed to remove device');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        router.push('/');
      } else {
        setError('Failed to delete account');
      }
    } catch (err) {
      setError('Failed to delete account');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
  };

  if (isPending) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center space-y-4'>
            <div className='h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto'></div>
            <p className='text-muted-foreground'>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
          <p className='text-muted-foreground'>
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className='h-4 w-4' />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className='grid gap-8 md:grid-cols-3'>
          {/* Main Settings */}
          <div className='md:col-span-2 space-y-6'>
            {/* Security Settings */}
            <Card id='security-section'>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Shield className='h-5 w-5 mr-2' />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Password Authentication */}
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label className='text-base'>Password Authentication</Label>
                    <p className='text-sm text-muted-foreground'>
                      Allow login with email and password
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailPasswordEnabled}
                    onCheckedChange={handleToggleEmailPassword}
                    disabled={isLoading}
                  />
                </div>

                <Separator />

                {/* Two-Factor Authentication */}
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label className='text-base'>
                      Two-Factor Authentication
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className='flex items-center space-x-2'>
                    {settings.twoFactorEnabled ? (
                      <Shield className='h-4 w-4 text-green-500' />
                    ) : (
                      <Unlock className='h-4 w-4 text-muted-foreground' />
                    )}
                    <Switch
                      checked={settings.twoFactorEnabled}
                      onCheckedChange={handleTwoFactorToggle}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Change Password Button */}
                <div className='flex justify-end'>
                  <Button
                    variant='outline'
                    onClick={() => setShowChangePasswordDialog(true)}
                  >
                    <Key className='h-4 w-4 mr-2' />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Bell className='h-5 w-5 mr-2' />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label className='text-base'>Email Notifications</Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={checked =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          email: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label className='text-base'>Push Notifications</Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={checked =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, push: checked },
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label className='text-base'>Security Alerts</Label>
                    <p className='text-sm text-muted-foreground'>
                      Get notified about security events
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.security}
                    onCheckedChange={checked =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          security: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label className='text-base'>
                      Marketing Communications
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      Receive updates about new features and offers
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketing}
                    onCheckedChange={checked =>
                      setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          marketing: checked,
                        },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Eye className='h-5 w-5 mr-2' />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <Label className='text-base'>Profile Visibility</Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value: 'public' | 'private') =>
                      setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, profileVisibility: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='public'>Public</SelectItem>
                      <SelectItem value='private'>Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label className='text-base'>Show Email Address</Label>
                    <p className='text-sm text-muted-foreground'>
                      Make your email visible on your profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showEmail}
                    onCheckedChange={checked =>
                      setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, showEmail: checked },
                      }))
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label className='text-base'>Show Activity Status</Label>
                    <p className='text-sm text-muted-foreground'>
                      Let others see when you are active
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showActivity}
                    onCheckedChange={checked =>
                      setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, showActivity: checked },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Palette className='h-5 w-5 mr-2' />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of the application
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <Label className='text-base'>Theme</Label>
                  <Select
                    value={settings.appearance.theme}
                    onValueChange={(value: 'light' | 'dark' | 'system') =>
                      setSettings(prev => ({
                        ...prev,
                        appearance: { ...prev.appearance, theme: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='light'>Light</SelectItem>
                      <SelectItem value='dark'>Dark</SelectItem>
                      <SelectItem value='system'>System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label className='text-base'>Language</Label>
                  <Select
                    value={settings.appearance.language}
                    onValueChange={value =>
                      setSettings(prev => ({
                        ...prev,
                        appearance: { ...prev.appearance, language: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='en'>English</SelectItem>
                      <SelectItem value='es'>Spanish</SelectItem>
                      <SelectItem value='fr'>French</SelectItem>
                      <SelectItem value='de'>German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label className='text-base'>Timezone</Label>
                  <Select
                    value={settings.appearance.timezone}
                    onValueChange={value =>
                      setSettings(prev => ({
                        ...prev,
                        appearance: { ...prev.appearance, timezone: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='UTC'>UTC</SelectItem>
                      <SelectItem value='EST'>Eastern Time</SelectItem>
                      <SelectItem value='PST'>Pacific Time</SelectItem>
                      <SelectItem value='CET'>Central European Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Account Overview */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Account Overview</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Email Verified
                  </span>
                  <div className='flex items-center space-x-1'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    <span className='text-sm font-medium'>Verified</span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    2FA Status
                  </span>
                  <div className='flex items-center space-x-1'>
                    {settings.twoFactorEnabled ? (
                      <Shield className='h-4 w-4 text-green-500' />
                    ) : (
                      <Unlock className='h-4 w-4 text-red-500' />
                    )}
                    <span className='text-sm font-medium'>
                      {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Trusted Devices
                  </span>
                  <span className='text-sm font-medium'>
                    {settings.trustedDevices.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Trusted Devices */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Trusted Devices</CardTitle>
                <CardDescription>
                  Devices that can access your account without 2FA
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                {settings.trustedDevices.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>
                    No trusted devices
                  </p>
                ) : (
                  settings.trustedDevices.map(device => (
                    <div
                      key={device.id}
                      className='flex items-center justify-between p-2 rounded-lg bg-muted/50'
                    >
                      <div className='flex items-center space-x-2'>
                        <Monitor className='h-4 w-4 text-muted-foreground' />
                        <div>
                          <p className='text-sm font-medium'>
                            {device.deviceName}
                            {device.isCurrentDevice && (
                              <span className='text-xs text-green-500 ml-1'>
                                (Current)
                              </span>
                            )}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {device.lastUsed}
                          </p>
                        </div>
                      </div>
                      {!device.isCurrentDevice && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRemoveDevice(device.id)}
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Data Management</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  disabled
                >
                  <Download className='h-4 w-4 mr-2' />
                  Download Your Data
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  disabled
                >
                  <Upload className='h-4 w-4 mr-2' />
                  Import Data
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className='border-destructive'>
              <CardHeader>
                <CardTitle className='text-base text-destructive'>
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Dialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant='destructive'
                      className='w-full justify-start'
                    >
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant='outline'
                        onClick={() => setShowDeleteDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant='destructive'
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Deleting...' : 'Delete Account'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app and enter the code
              below to verify setup.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            {qrCode && (
              <div className='flex flex-col items-center space-y-4 p-4 border rounded-lg bg-muted/50'>
                <QrCode className='h-32 w-32 text-muted-foreground' />
                <div className='text-center space-y-2'>
                  <p className='text-sm font-medium'>Secret Key:</p>
                  <div className='flex items-center space-x-2 bg-background p-2 rounded border'>
                    <code className='text-xs flex-1'>{qrCode}</code>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => copyToClipboard(qrCode)}
                    >
                      <Copy className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {backupCodes.length > 0 && (
              <div className='space-y-2'>
                <Label>Backup Codes (save these in a safe place):</Label>
                <div className='grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg border'>
                  {backupCodes.map((code, index) => (
                    <code key={index} className='text-xs'>
                      {code}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShow2FADialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnable2FA} disabled={isLoading}>
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <ChangePasswordForm
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
      />
    </div>
  );
}
