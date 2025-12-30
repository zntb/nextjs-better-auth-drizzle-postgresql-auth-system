/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { authClient, useSession } from '@/lib/auth-client';
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
  Copy,
  Loader2,
} from 'lucide-react';
import { ChangePasswordForm } from '@/components/auth/change-password-form';
import {
  toggleEmailPassword,
  updateDefaultLoginMethod,
  enableTwoFactor,
  disableTwoFactor,
  getTrustedDevices,
  removeTrustedDevice,
  deleteAccount,
  getCurrentDeviceTrustStatus,
  toggleCurrentDeviceTrust,
  updateNotificationPreferences,
  confirmTwoFactorEnabled,
} from '@/actions/settings-actions';
import { Input } from '@/components/ui/input';
import { AddPasswordDialog } from '@/components/auth/add-password-dialog';
import { canEnable2FA } from '@/actions/add-password-for-oauth';
import { Badge } from '@/components/ui/badge';

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
  defaultLoginMethod?: string | null;
  emailNotificationsEnabled?: boolean | null;
  securityAlertsEnabled?: boolean | null;
  [key: string]: unknown;
}

interface SettingsState {
  emailPasswordEnabled: boolean;
  defaultLoginMethod: 'email' | 'username';
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
  const [showChangePasswordDialog, setShowChangePasswordDialog] =
    useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [show2FAPasswordDialog, setShow2FAPasswordDialog] = useState(false);
  const [totpURI, setTotpURI] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorPassword, setTwoFactorPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [can2FA, setCan2FA] = useState<{
    canEnable: boolean;
    needsPassword: boolean;
    message: string;
    providers?: string[];
  } | null>(null);
  const [showAddPasswordDialog, setShowAddPasswordDialog] = useState(false);
  const [currentDeviceTrust, setCurrentDeviceTrust] = useState<{
    isTrusted: boolean;
    deviceName: string;
    deviceId: string;
  } | null>(null);

  // Settings state
  const [settings, setSettings] = useState<SettingsState>({
    emailPasswordEnabled: true,
    defaultLoginMethod: 'email',
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
    const check2FACapability = async () => {
      const result = await canEnable2FA();
      if (result.success !== undefined) {
        setCan2FA({
          canEnable: result.canEnable,
          needsPassword: result.needsPassword || false,
          message: result.message,
          providers: result.providers,
        });
      }
    };

    if (session?.user) {
      check2FACapability();
    }
  }, [session]);

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
        defaultLoginMethod:
          ((session.user as ExtendedUser).defaultLoginMethod as
            | 'email'
            | 'username') ?? 'email',
        twoFactorEnabled: session.user.twoFactorEnabled || false,
        notifications: {
          ...prev.notifications,
          email:
            (session.user as ExtendedUser).emailNotificationsEnabled ?? true,
          security:
            (session.user as ExtendedUser).securityAlertsEnabled ?? true,
        },
      }));
      loadTrustedDevices();
      loadCurrentDeviceTrustStatus();
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

  const handlePasswordAdded = async () => {
    // Refresh 2FA capability check
    const result = await canEnable2FA();
    if (result.success !== undefined) {
      setCan2FA({
        canEnable: result.canEnable,
        needsPassword: result.needsPassword || false,
        message: result.message,
        providers: result.providers,
      });
    }

    // Show success message
    setSuccess('Password authentication added! You can now enable 2FA.');
    setTimeout(() => setSuccess(''), 3000);
  };

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

  const loadCurrentDeviceTrustStatus = async () => {
    try {
      const result = await getCurrentDeviceTrustStatus();
      if (result.success) {
        setCurrentDeviceTrust({
          isTrusted: result.isTrusted,
          deviceName: result.deviceName,
          deviceId: result.deviceId,
        });
      }
    } catch (error) {
      console.error('Failed to load current device trust status:', error);
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

  const handleUpdateDefaultLoginMethod = async (
    method: 'email' | 'username',
  ) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateDefaultLoginMethod(method);
      if (result.error) {
        setError(result.error);
      } else {
        setSettings(prev => ({ ...prev, defaultLoginMethod: method }));
        setSuccess(`Default login method updated to ${method}`);
      }
    } catch (err) {
      setError('Failed to update default login method');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    if (settings.twoFactorEnabled) {
      // Disable 2FA - show password prompt
      setShow2FAPasswordDialog(true);
    } else {
      // Enable 2FA - show password prompt
      setShow2FAPasswordDialog(true);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!twoFactorPassword) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (settings.twoFactorEnabled) {
        // Disable 2FA
        const result = await disableTwoFactor(twoFactorPassword);
        if (result.error) {
          setError(result.error);
        } else {
          // Force session refresh
          const { data: newSession } = await authClient.getSession();
          setSettings(prev => ({
            ...prev,
            twoFactorEnabled: newSession?.user?.twoFactorEnabled || false,
          }));
          setSuccess('Two-factor authentication disabled successfully!');
          setShow2FAPasswordDialog(false);
          setTwoFactorPassword('');
        }
      } else {
        // Enable 2FA (creates secret but doesn't fully enable yet)
        const result = await enableTwoFactor(twoFactorPassword);
        if (result.error) {
          setError(result.error);
        } else {
          // Show setup dialog - user must verify before 2FA is fully enabled
          setTotpURI(result.totpURI || '');
          setBackupCodes(result.backupCodes || []);
          setShow2FAPasswordDialog(false);
          setShow2FADialog(true);
          setTwoFactorPassword('');
          setError('');
        }
      }
    } catch (err) {
      setError('Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');
    setSuccess('');

    try {
      // Use CLIENT-SIDE verification (not server-side API)
      const result = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
      });

      if (result.error) {
        setError(
          result.error.message ||
            'Invalid verification code. Please try again.',
        );
        setIsVerifying(false);
        return;
      }

      // Success! 2FA is now fully enabled
      setSuccess('Verifying your setup...');

      // Wait for backend to process
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh session to get updated user data
      const { data: newSession } = await authClient.getSession();

      if (newSession?.user?.twoFactorEnabled) {
        setSettings(prev => ({ ...prev, twoFactorEnabled: true }));
        setSuccess('Two-factor authentication enabled successfully! 🎉');

        // Send notification that 2FA has been enabled
        await confirmTwoFactorEnabled();

        // Close dialog after showing success
        setTimeout(() => {
          setShow2FADialog(false);
          setVerificationCode('');
          setTotpURI('');
          setBackupCodes([]);
          setError('');
          setSuccess('');
        }, 2000);
      } else {
        // Session might not be immediately updated
        setSuccess('2FA enabled! Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
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

  const handleToggleCurrentDeviceTrust = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await toggleCurrentDeviceTrust();
      if (result.error) {
        setError(result.error);
      } else {
        setCurrentDeviceTrust(prev =>
          prev
            ? {
                ...prev,
                isTrusted: !!result.isTrusted,
              }
            : null,
        );
        setSuccess(result.message || 'Device trust status updated');

        // Reload trusted devices list to reflect changes
        loadTrustedDevices();
      }
    } catch (err) {
      setError('Failed to update device trust status');
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

  const handleNotificationPreferenceChange = async (
    type: 'email' | 'security',
    enabled: boolean,
  ) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const emailNotificationsEnabled =
        type === 'email' ? enabled : settings.notifications.email;
      const securityAlertsEnabled =
        type === 'security' ? enabled : settings.notifications.security;

      const result = await updateNotificationPreferences(
        emailNotificationsEnabled,
        securityAlertsEnabled,
      );

      if (result.error) {
        setError(result.error);
        // Revert the switch state on error
        setSettings(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [type]: !enabled,
          },
        }));
      } else {
        setSettings(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [type]: enabled,
          },
        }));
        setSuccess(
          `${type === 'email' ? 'Email notifications' : 'Security alerts'} ${
            enabled ? 'enabled' : 'disabled'
          }`,
        );
      }
    } catch (err) {
      setError('Failed to update notification preferences');
      // Revert the switch state on error
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [type]: !enabled,
        },
      }));
    } finally {
      setIsLoading(false);
    }
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

                {/* Default Login Method */}
                {settings.emailPasswordEnabled && (
                  <div className='space-y-3'>
                    <Label className='text-base'>Default Login Method</Label>
                    <p className='text-sm text-muted-foreground'>
                      Choose your preferred way to sign in with password
                    </p>
                    <Select
                      value={settings.defaultLoginMethod}
                      onValueChange={(value: 'email' | 'username') =>
                        handleUpdateDefaultLoginMethod(value)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='email'>Email Address</SelectItem>
                        <SelectItem value='username'>Username</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                {/* Two-Factor Authentication */}
                {can2FA === null ? (
                  // Loading state
                  <div className='flex items-center justify-between opacity-50'>
                    <div className='space-y-1'>
                      <Label className='text-base'>
                        Two-Factor Authentication
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Checking availability...
                      </p>
                    </div>
                    <div className='h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                  </div>
                ) : can2FA.needsPassword ? (
                  // OAuth user needs to add password first
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <Label className='text-base'>
                          Two-Factor Authentication
                        </Label>
                        <p className='text-sm text-muted-foreground'>
                          Add password authentication to enable 2FA
                        </p>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Unlock className='h-4 w-4 text-orange-500' />
                        <Badge variant='secondary'>Requires Password</Badge>
                      </div>
                    </div>

                    <Alert>
                      <Shield className='h-4 w-4' />
                      <AlertTitle>Enable Two-Factor Authentication</AlertTitle>
                      <AlertDescription>
                        {can2FA.message}
                        {can2FA.providers && can2FA.providers.length > 0 && (
                          <div className='mt-2 flex flex-wrap gap-2'>
                            <span className='text-xs'>Current providers:</span>
                            {can2FA.providers.map(provider => (
                              <Badge
                                key={provider}
                                variant='outline'
                                className='capitalize'
                              >
                                {provider}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={() => setShowAddPasswordDialog(true)}
                      className='w-full'
                      disabled={isLoading}
                    >
                      <Key className='h-4 w-4 mr-2' />
                      Add Password to Enable 2FA
                    </Button>

                    <p className='text-xs text-muted-foreground text-center'>
                      You'll still be able to sign in with{' '}
                      {can2FA.providers?.join(', ')}
                    </p>
                  </div>
                ) : can2FA.canEnable ? (
                  // Can enable 2FA (has password)
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
                ) : null}

                {/* Current Device Trust - Only show when 2FA is enabled */}
                {settings.twoFactorEnabled && currentDeviceTrust ? (
                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <Label className='text-base'>
                        Trusted Device: {currentDeviceTrust.deviceName}
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        {currentDeviceTrust.isTrusted
                          ? 'This device can bypass 2FA authentication'
                          : 'This device will require 2FA authentication'}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      {currentDeviceTrust.isTrusted ? (
                        <Shield className='h-4 w-4 text-green-500' />
                      ) : (
                        <Monitor className='h-4 w-4 text-muted-foreground' />
                      )}
                      <Switch
                        checked={currentDeviceTrust.isTrusted}
                        onCheckedChange={handleToggleCurrentDeviceTrust}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ) : !settings.twoFactorEnabled ? (
                  <div className='flex items-center justify-between p-3 rounded-lg bg-muted/50'>
                    <div className='space-y-1'>
                      <Label className='text-base text-muted-foreground'>
                        Trusted Device
                      </Label>
                      <p className='text-sm text-muted-foreground'>
                        Enable two-factor authentication to manage trusted
                        devices
                      </p>
                    </div>
                    <Unlock className='h-4 w-4 text-muted-foreground' />
                  </div>
                ) : null}

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
                      handleNotificationPreferenceChange('email', checked)
                    }
                    disabled={isLoading}
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
                      handleNotificationPreferenceChange('security', checked)
                    }
                    disabled={isLoading}
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

      {/* 2FA Password Dialog */}
      <Dialog
        open={show2FAPasswordDialog}
        onOpenChange={setShow2FAPasswordDialog}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {settings.twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor
              Authentication
            </DialogTitle>
            <DialogDescription>
              Please enter your password to continue
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='2fa-password'>Password</Label>
              <Input
                id='2fa-password'
                type='password'
                value={twoFactorPassword}
                onChange={e => setTwoFactorPassword(e.target.value)}
                placeholder='Enter your password'
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShow2FAPasswordDialog(false);
                setTwoFactorPassword('');
                setError('');
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog
        open={show2FADialog}
        onOpenChange={open => {
          if (!open) {
            setShow2FADialog(false);
            setVerificationCode('');
            setTotpURI('');
            setBackupCodes([]);
            setError('');
            setSuccess('');
          }
        }}
      >
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
          <DialogHeader className='flex-shrink-0'>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Complete these steps to secure your account
            </DialogDescription>
          </DialogHeader>
          <div className='flex-1 overflow-y-auto space-y-6 pr-2'>
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className='h-4 w-4' />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Scan QR Code */}
            {totpURI && (
              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold'>
                    1
                  </div>
                  <h3 className='font-semibold'>Scan QR Code</h3>
                </div>
                <p className='text-sm text-muted-foreground ml-10'>
                  Use your authenticator app (Google Authenticator, Authy, etc.)
                  to scan this QR code
                </p>
                <div className='flex flex-col items-center space-y-4 p-4 border rounded-lg bg-muted/50 ml-10'>
                  <div className='bg-white p-4 rounded-lg'>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        totpURI,
                      )}`}
                      alt='2FA QR Code'
                      className='h-48 w-48'
                    />
                  </div>
                  <div className='text-center space-y-2 w-full'>
                    <p className='text-sm font-medium'>
                      Or enter this key manually:
                    </p>
                    <div className='flex items-center space-x-2 bg-background p-2 rounded border'>
                      <code className='text-xs flex-1 break-all'>
                        {totpURI.split('secret=')[1]?.split('&')[0]}
                      </code>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          navigator.clipboard.writeText(
                            totpURI.split('secret=')[1]?.split('&')[0] || '',
                          );
                          setSuccess('Key copied to clipboard');
                          setTimeout(() => setSuccess(''), 2000);
                        }}
                      >
                        <Copy className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Save Backup Codes */}
            {backupCodes.length > 0 && (
              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold'>
                    2
                  </div>
                  <h3 className='font-semibold'>Save Backup Codes</h3>
                </div>
                <p className='text-sm text-muted-foreground ml-10'>
                  Save these backup codes in a safe place. Each can be used once
                  if you lose access to your authenticator.
                </p>
                <div className='space-y-2 ml-10'>
                  <div className='grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg border'>
                    {backupCodes.map((code, index) => (
                      <code
                        key={index}
                        className='text-xs p-1 bg-background rounded'
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full'
                    onClick={() => {
                      navigator.clipboard.writeText(backupCodes.join('\n'));
                      setSuccess('Backup codes copied to clipboard');
                      setTimeout(() => setSuccess(''), 2000);
                    }}
                  >
                    <Copy className='h-4 w-4 mr-2' />
                    Copy All Backup Codes
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full'
                    onClick={() => {
                      const blob = new Blob([backupCodes.join('\n')], {
                        type: 'text/plain',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = '2fa-backup-codes.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className='h-4 w-4 mr-2' />
                    Download Backup Codes
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Verify Setup */}
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold'>
                  3
                </div>
                <h3 className='font-semibold'>Verify Setup</h3>
              </div>
              <p className='text-sm text-muted-foreground ml-10'>
                Enter the 6-digit code from your authenticator app to complete
                setup
              </p>
              <div className='space-y-2 ml-10 mb-5'>
                <Label htmlFor='verification-code'>Verification Code</Label>
                <Input
                  id='verification-code'
                  type='text'
                  maxLength={6}
                  value={verificationCode}
                  onChange={e =>
                    setVerificationCode(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder='000000'
                  disabled={isVerifying}
                  className='text-center text-lg tracking-widest font-mono'
                />
                <p className='text-xs text-muted-foreground'>
                  This confirms you've scanned the QR code correctly
                </p>
              </div>
            </div>

            {/* Important Notice */}
            <Alert className='ml-10'>
              <Shield className='h-4 w-4' />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Make sure you've saved your backup codes before completing
                setup. You'll need them if you lose access to your authenticator
                app.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className='flex-shrink-0 mt-6'>
            <Button
              variant='outline'
              onClick={() => {
                setShow2FADialog(false);
                setVerificationCode('');
                setTotpURI('');
                setBackupCodes([]);
                setError('');
                setSuccess('');
              }}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyTOTP}
              disabled={isVerifying || verificationCode.length !== 6}
            >
              {isVerifying ? (
                <>
                  <div className='h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className='h-4 w-4 mr-2' />
                  Complete Setup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <ChangePasswordForm
        open={showChangePasswordDialog}
        onOpenChange={setShowChangePasswordDialog}
      />
      {can2FA?.needsPassword && (
        <AddPasswordDialog
          open={showAddPasswordDialog}
          onOpenChange={setShowAddPasswordDialog}
          providers={can2FA.providers || []}
          onSuccess={handlePasswordAdded}
        />
      )}
    </div>
  );
}
