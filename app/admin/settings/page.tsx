// app/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/actions/auth-actions';
import {
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  sendTestNotification,
  getNotificationStatistics,
} from '@/actions/admin-notification-actions';
import { NotificationHistory } from '@/components/admin/notification-history';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Shield,
  Users,
  Mail,
  Database,
  Globe,
  Bell,
  Lock,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// Type for current user based on database schema
type CurrentUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role?: string | null;
  twoFactorEnabled?: boolean | null; // Optional to match Better Auth types
  username?: string | null;
  displayUsername?: string | null;
  emailPasswordEnabled?: boolean | null; // Optional to match Better Auth types
  defaultLoginMethod?: string | null; // Optional to match Better Auth types
  emailNotificationsEnabled?: boolean | null; // Optional to match Better Auth types
  securityAlertsEnabled?: boolean | null; // Optional to match Better Auth types
  banned?: boolean | null; // Optional to match Better Auth types
  banReason?: string | null;
  banExpires?: Date | null;
  blocked?: boolean | null; // Optional to match Better Auth types
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
} | null;

export default function AdminSettingsPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    testEmail: '',
  });
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    details?: string | { host: string; port: number; user: string };
  } | null>(null);

  // Notification settings state
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotificationsEnabled: true,
    securityAlertsEnabled: true,
    adminAlertsEnabled: true,
    systemUpdatesEnabled: true,
    userActivityReportsEnabled: false,
    weeklyDigestEnabled: false,
  });
  const [notificationStats, setNotificationStats] = useState<{
    emailNotifications: { enabled: number; disabled: number; total: number };
    securityAlerts: { enabled: number; disabled: number; total: number };
  } | null>(null);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);
  const [testNotificationMessage, setTestNotificationMessage] = useState('');
  const [notificationStatsLoading, setNotificationStatsLoading] =
    useState(false);

  // Check admin access and load notification preferences on component mount
  useEffect(() => {
    async function initializeSettings() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        if (user) {
          // Load notification preferences
          const prefsResult = await getUserNotificationPreferences();
          if (prefsResult.success && prefsResult.preferences) {
            setNotificationPreferences(prev => ({
              ...prev,
              emailNotificationsEnabled:
                prefsResult.preferences.emailNotificationsEnabled,
              securityAlertsEnabled:
                prefsResult.preferences.securityAlertsEnabled,
            }));
          }

          // Load notification statistics (admin only)
          if (user.role === 'admin') {
            setNotificationStatsLoading(true);
            const statsResult = await getNotificationStatistics();
            if (statsResult.success && statsResult.statistics) {
              setNotificationStats(statsResult.statistics);
            }
            setNotificationStatsLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to initialize settings:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }
    initializeSettings();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleEmailConfigChange = (field: string, value: string) => {
    setEmailConfig(prev => ({ ...prev, [field]: value }));
    // Clear previous test results when config changes
    setTestEmailResult(null);
  };

  const handleTestEmail = async () => {
    // Validate required fields
    const requiredFields = [
      'smtpHost',
      'smtpPort',
      'smtpUser',
      'smtpPassword',
      'testEmail',
    ];
    const missingFields = requiredFields.filter(
      field => !emailConfig[field as keyof typeof emailConfig],
    );

    if (missingFields.length > 0) {
      toast.error(`Please fill in all fields: ${missingFields.join(', ')}`);
      return;
    }

    setTestEmailLoading(true);
    setTestEmailResult(null);

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpHost: emailConfig.smtpHost,
          smtpPort: emailConfig.smtpPort,
          smtpUser: emailConfig.smtpUser,
          smtpPassword: emailConfig.smtpPassword,
          testEmail: emailConfig.testEmail,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTestEmailResult({
          success: true,
          message: result.message,
          details: result.details,
        });
        toast.success('Email configuration test successful!');
      } else {
        setTestEmailResult({
          success: false,
          error: result.error,
          details: result.details,
        });
        toast.error(result.error || 'Email configuration test failed');
      }
    } catch (error) {
      console.error('Test email error:', error);
      setTestEmailResult({
        success: false,
        error: 'Failed to test email configuration',
        details: 'Please check your network connection and try again.',
      });
      toast.error('Failed to test email configuration');
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleNotificationPreferenceChange = (key: string, value: boolean) => {
    setNotificationPreferences(prev => ({ ...prev, [key]: value }));
  };

  const saveNotificationPreferences = async () => {
    setNotificationLoading(true);
    try {
      const result = await updateUserNotificationPreferences(
        currentUser!.id,
        notificationPreferences,
      );

      if (result.success) {
        toast.success('Notification preferences saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save notification preferences');
      }
    } catch (error) {
      console.error('Save notification preferences error:', error);
      toast.error('Failed to save notification preferences');
    } finally {
      setNotificationLoading(false);
    }
  };

  const sendTestNotificationEmail = async (type: 'security' | 'general') => {
    if (!testNotificationMessage.trim()) {
      toast.error('Please enter a test message');
      return;
    }

    setTestNotificationLoading(true);
    try {
      const result = await sendTestNotification(type, testNotificationMessage);

      if (result.success) {
        toast.success('Test notification sent successfully!');
        setTestNotificationMessage('');
      } else {
        toast.error(result.error || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Send test notification error:', error);
      toast.error('Failed to send test notification');
    } finally {
      setTestNotificationLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Admin Settings</h1>
        <p className='text-muted-foreground'>
          Configure system-wide settings and preferences for your application.
        </p>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Settings className='h-5 w-5' />
            <span>System Overview</span>
          </CardTitle>
          <CardDescription>
            Current system status and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                <Shield className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm font-medium'>Authentication</p>
                <p className='text-xs text-muted-foreground'>Better Auth v2</p>
              </div>
            </div>

            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Database className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm font-medium'>Database</p>
                <p className='text-xs text-muted-foreground'>PostgreSQL</p>
              </div>
            </div>

            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                <Globe className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-sm font-medium'>Next.js</p>
                <p className='text-xs text-muted-foreground'>v14 App Router</p>
              </div>
            </div>

            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center'>
                <Users className='h-5 w-5 text-orange-600' />
              </div>
              <div>
                <p className='text-sm font-medium'>Drizzle ORM</p>
                <p className='text-xs text-muted-foreground'>Type-safe</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Authentication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Shield className='h-5 w-5' />
              <span>Authentication Settings</span>
            </CardTitle>
            <CardDescription>
              Configure authentication and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Email Verification Required</Label>
                <p className='text-sm text-muted-foreground'>
                  Require email verification for new accounts
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Password Reset</Label>
                <p className='text-sm text-muted-foreground'>
                  Allow password reset requests
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Social Login</Label>
                <p className='text-sm text-muted-foreground'>
                  Enable social authentication providers
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Two-Factor Authentication</Label>
                <p className='text-sm text-muted-foreground'>
                  Require 2FA for admin accounts
                </p>
              </div>
              <Switch checked={currentUser?.twoFactorEnabled || false} />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Mail className='h-5 w-5' />
              <span>Email Settings</span>
            </CardTitle>
            <CardDescription>
              Configure email templates and delivery
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='smtp-host'>SMTP Host</Label>
              <Input
                id='smtp-host'
                placeholder='smtp.example.com'
                value={emailConfig.smtpHost}
                onChange={e =>
                  handleEmailConfigChange('smtpHost', e.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='smtp-port'>SMTP Port</Label>
              <Input
                id='smtp-port'
                placeholder='587'
                value={emailConfig.smtpPort}
                onChange={e =>
                  handleEmailConfigChange('smtpPort', e.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='smtp-user'>SMTP Username</Label>
              <Input
                id='smtp-user'
                placeholder='username@example.com'
                value={emailConfig.smtpUser}
                onChange={e =>
                  handleEmailConfigChange('smtpUser', e.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='smtp-password'>SMTP Password</Label>
              <Input
                id='smtp-password'
                type='password'
                placeholder='••••••••'
                value={emailConfig.smtpPassword}
                onChange={e =>
                  handleEmailConfigChange('smtpPassword', e.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='test-email'>Test Email Address</Label>
              <Input
                id='test-email'
                type='email'
                placeholder='test@example.com'
                value={emailConfig.testEmail}
                onChange={e =>
                  handleEmailConfigChange('testEmail', e.target.value)
                }
              />
            </div>

            <div className='space-y-3'>
              <Button
                className='w-full'
                onClick={handleTestEmail}
                disabled={testEmailLoading}
              >
                {testEmailLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Testing Configuration...
                  </>
                ) : (
                  'Test Email Configuration'
                )}
              </Button>

              {/* Test Results */}
              {testEmailResult && (
                <div
                  className={`p-3 rounded-lg border ${
                    testEmailResult.success
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className='flex items-start space-x-2'>
                    {testEmailResult.success ? (
                      <CheckCircle className='h-5 w-5 mt-0.5 text-green-600' />
                    ) : (
                      <XCircle className='h-5 w-5 mt-0.5 text-red-600' />
                    )}
                    <div className='flex-1'>
                      <p className='font-medium'>
                        {testEmailResult.success
                          ? 'Test Successful!'
                          : 'Test Failed'}
                      </p>
                      <p className='text-sm mt-1'>
                        {testEmailResult.success
                          ? testEmailResult.message
                          : testEmailResult.error}
                      </p>
                      {testEmailResult.details && (
                        <p className='text-sm mt-2 opacity-80'>
                          {typeof testEmailResult.details === 'object'
                            ? `Host: ${testEmailResult.details.host}, Port: ${testEmailResult.details.port}, User: ${testEmailResult.details.user}`
                            : testEmailResult.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Lock className='h-5 w-5' />
              <span>Security Settings</span>
            </CardTitle>
            <CardDescription>
              Configure security policies and restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='session-timeout'>Session Timeout (minutes)</Label>
              <Input id='session-timeout' type='number' defaultValue='60' />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='max-login-attempts'>Max Login Attempts</Label>
              <Input id='max-login-attempts' type='number' defaultValue='5' />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Account Lockout</Label>
                <p className='text-sm text-muted-foreground'>
                  Lock accounts after failed attempts
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Rate Limiting</Label>
                <p className='text-sm text-muted-foreground'>
                  Enable API rate limiting
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Bell className='h-5 w-5' />
              <span>Notification Settings</span>
              {notificationStats && (
                <Badge variant='secondary' className='ml-2'>
                  {notificationStats.emailNotifications.enabled +
                    notificationStats.securityAlerts.enabled}{' '}
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* User Notification Preferences */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Email Notifications</Label>
                  <p className='text-sm text-muted-foreground'>
                    Receive general email notifications
                  </p>
                </div>
                <Switch
                  checked={notificationPreferences.emailNotificationsEnabled}
                  onCheckedChange={checked =>
                    handleNotificationPreferenceChange(
                      'emailNotificationsEnabled',
                      checked,
                    )
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Security Alerts</Label>
                  <p className='text-sm text-muted-foreground'>
                    Receive security-related notifications
                  </p>
                </div>
                <Switch
                  checked={notificationPreferences.securityAlertsEnabled}
                  onCheckedChange={checked =>
                    handleNotificationPreferenceChange(
                      'securityAlertsEnabled',
                      checked,
                    )
                  }
                />
              </div>

              {currentUser?.role === 'admin' && (
                <>
                  <Separator />
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>
                      Admin-Specific Notifications
                    </h4>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label>Admin Alerts</Label>
                        <p className='text-sm text-muted-foreground'>
                          Critical system alerts for administrators
                        </p>
                      </div>
                      <Switch
                        checked={notificationPreferences.adminAlertsEnabled}
                        onCheckedChange={checked =>
                          handleNotificationPreferenceChange(
                            'adminAlertsEnabled',
                            checked,
                          )
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label>System Updates</Label>
                        <p className='text-sm text-muted-foreground'>
                          Notifications about system updates and maintenance
                        </p>
                      </div>
                      <Switch
                        checked={notificationPreferences.systemUpdatesEnabled}
                        onCheckedChange={checked =>
                          handleNotificationPreferenceChange(
                            'systemUpdatesEnabled',
                            checked,
                          )
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label>User Activity Reports</Label>
                        <p className='text-sm text-muted-foreground'>
                          Weekly reports on user activity and system usage
                        </p>
                      </div>
                      <Switch
                        checked={
                          notificationPreferences.userActivityReportsEnabled
                        }
                        onCheckedChange={checked =>
                          handleNotificationPreferenceChange(
                            'userActivityReportsEnabled',
                            checked,
                          )
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label>Weekly Digest</Label>
                        <p className='text-sm text-muted-foreground'>
                          Summary of weekly system statistics and events
                        </p>
                      </div>
                      <Switch
                        checked={notificationPreferences.weeklyDigestEnabled}
                        onCheckedChange={checked =>
                          handleNotificationPreferenceChange(
                            'weeklyDigestEnabled',
                            checked,
                          )
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Test Notification Section */}
            {currentUser?.role === 'admin' && (
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>Test Notifications</h4>
                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='test-notification-message'>
                      Test Message
                    </Label>
                    <Textarea
                      id='test-notification-message'
                      placeholder='Enter a test message to send to yourself...'
                      value={testNotificationMessage}
                      onChange={e => setTestNotificationMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className='flex space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => sendTestNotificationEmail('security')}
                      disabled={testNotificationLoading}
                    >
                      {testNotificationLoading ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Sending...
                        </>
                      ) : (
                        'Test Security Alert'
                      )}
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => sendTestNotificationEmail('general')}
                      disabled={testNotificationLoading}
                    >
                      {testNotificationLoading ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Sending...
                        </>
                      ) : (
                        'Test General Notification'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Statistics */}
            {currentUser?.role === 'admin' && notificationStats && (
              <div className='space-y-4'>
                <Separator />
                <h4 className='text-sm font-medium'>Notification Statistics</h4>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium'>Email Notifications</p>
                    <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                      <span className='inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800'>
                        {notificationStats.emailNotifications.enabled} Enabled
                      </span>
                      <span className='inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800'>
                        {notificationStats.emailNotifications.disabled} Disabled
                      </span>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium'>Security Alerts</p>
                    <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                      <span className='inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800'>
                        {notificationStats.securityAlerts.enabled} Enabled
                      </span>
                      <span className='inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800'>
                        {notificationStats.securityAlerts.disabled} Disabled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentUser?.role === 'admin' && notificationStatsLoading && (
              <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>Loading statistics...</span>
              </div>
            )}

            {/* Notification History */}
            {currentUser?.role === 'admin' && (
              <div className='space-y-4'>
                <Separator />
                <h4 className='text-sm font-medium'>Notification History</h4>
                <NotificationHistory />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Settings */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium'>Save Configuration</p>
              <p className='text-sm text-muted-foreground'>
                Changes will be applied immediately
              </p>
            </div>
            <Button
              onClick={saveNotificationPreferences}
              disabled={notificationLoading}
            >
              {notificationLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                'Save All Settings'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
