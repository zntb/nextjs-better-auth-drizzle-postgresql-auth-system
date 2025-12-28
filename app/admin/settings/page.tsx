// app/admin/settings/page.tsx
import { getCurrentUser } from '@/actions/auth-actions';
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
import {
  Settings,
  Shield,
  Users,
  Mail,
  Database,
  Globe,
  Bell,
  Lock,
} from 'lucide-react';

export default async function AdminSettingsPage() {
  const currentUser = await getCurrentUser();

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
              <Switch />
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
              <Input id='smtp-host' placeholder='smtp.example.com' />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='smtp-port'>SMTP Port</Label>
              <Input id='smtp-port' placeholder='587' />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='smtp-user'>SMTP Username</Label>
              <Input id='smtp-user' placeholder='username@example.com' />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='smtp-password'>SMTP Password</Label>
              <Input
                id='smtp-password'
                type='password'
                placeholder='••••••••'
              />
            </div>

            <Button className='w-full'>Test Email Configuration</Button>
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
            </CardTitle>
            <CardDescription>
              Configure system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Security Alerts</Label>
                <p className='text-sm text-muted-foreground'>
                  Email admin about security events
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>New User Notifications</Label>
                <p className='text-sm text-muted-foreground'>
                  Notify when new users register
                </p>
              </div>
              <Switch />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>System Updates</Label>
                <p className='text-sm text-muted-foreground'>
                  Notify about system updates
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='admin-email'>Admin Email</Label>
              <Input id='admin-email' placeholder='admin@example.com' />
            </div>
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
            <Button>Save All Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
