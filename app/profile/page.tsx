// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
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
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Mail,
  Shield,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Camera,
  Settings,
  Key,
  Clock,
} from 'lucide-react';
import { updateProfile } from '@/actions/profile-actions';

interface UserStats {
  memberSince: string;
  lastLogin: string;
  loginCount: number;
  verifiedEmail: boolean;
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  // Mock user stats (in a real app, you'd fetch this from your database)
  const [userStats] = useState<UserStats>({
    memberSince: '2024-01-15',
    lastLogin: '2024-12-27',
    loginCount: 127,
    verifiedEmail: true,
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      setName(session.user.name || '');
      setUsername(session.user.username || '');
    }
  }, [session, isPending, router]);

  const handleSave = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile({
        name,
        username,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName(session?.user?.name || '');
    setUsername(session?.user?.username || '');
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (isPending) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center space-y-4'>
            <div className='h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto'></div>
            <p className='text-muted-foreground'>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Profile Settings
          </h1>
          <p className='text-muted-foreground'>
            Manage your account information and preferences
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
          {/* Profile Card */}
          <Card className='md:col-span-2'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your profile details and account information
                  </CardDescription>
                </div>
                <div className='flex items-center space-x-2'>
                  {!isEditing ? (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className='h-4 w-4 mr-2' />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        <X className='h-4 w-4 mr-2' />
                        Cancel
                      </Button>
                      <Button
                        size='sm'
                        onClick={handleSave}
                        disabled={isLoading}
                      >
                        <Save className='h-4 w-4 mr-2' />
                        {isLoading ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Avatar Section */}
              <div className='flex items-center space-x-4'>
                <Avatar className='h-20 w-20'>
                  <AvatarImage
                    src={user.image || ''}
                    alt={user.name || 'User'}
                  />
                  <AvatarFallback className='text-lg'>
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-1'>
                  <h3 className='text-lg font-semibold'>
                    {user.name || 'User'}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {user.email || 'No email available'}
                  </p>
                  <Button variant='outline' size='sm' disabled>
                    <Camera className='h-4 w-4 mr-2' />
                    Change Photo
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className='space-y-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Full Name</Label>
                  <Input
                    id='name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={!isEditing || isLoading}
                    placeholder='Enter your full name'
                  />
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='username'>Username</Label>
                  <Input
                    id='username'
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    disabled={!isEditing || isLoading}
                    placeholder='Choose a unique username'
                  />
                  <p className='text-xs text-muted-foreground'>
                    This will be your unique identifier on the platform
                  </p>
                </div>

                <div className='grid gap-2'>
                  <Label htmlFor='email'>Email Address</Label>
                  <Input
                    id='email'
                    value={user.email || ''}
                    disabled
                    className='bg-muted/50'
                  />
                  <p className='text-xs text-muted-foreground flex items-center'>
                    <Mail className='h-3 w-3 mr-1' />
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Account Status</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Email Verified
                  </span>
                  <div className='flex items-center space-x-1'>
                    {userStats.verifiedEmail ? (
                      <CheckCircle className='h-4 w-4 text-green-500' />
                    ) : (
                      <AlertCircle className='h-4 w-4 text-red-500' />
                    )}
                    <span className='text-sm font-medium'>
                      {userStats.verifiedEmail ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    2FA Enabled
                  </span>
                  <div className='flex items-center space-x-1'>
                    <Shield className='h-4 w-4 text-muted-foreground' />
                    <span className='text-sm font-medium'>
                      {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Account Created
                  </span>
                  <span className='text-sm font-medium'>
                    {new Date(userStats.memberSince).toLocaleDateString()}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Last Login
                  </span>
                  <span className='text-sm font-medium'>
                    {new Date(userStats.lastLogin).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => router.push('/settings')}
                >
                  <Settings className='h-4 w-4 mr-2' />
                  Account Settings
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => router.push('/change-password')}
                >
                  <Key className='h-4 w-4 mr-2' />
                  Change Password
                </Button>
                <Button
                  variant='outline'
                  className='w-full justify-start'
                  onClick={() => router.push('/settings#security')}
                >
                  <Shield className='h-4 w-4 mr-2' />
                  Security Options
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Total Logins
                  </span>
                  <span className='text-sm font-medium'>
                    {userStats.loginCount}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground flex items-center'>
                    <Clock className='h-3 w-3 mr-1' />
                    Days Active
                  </span>
                  <span className='text-sm font-medium'>
                    {Math.floor(
                      (Date.now() - new Date(userStats.memberSince).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
