'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-client';
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
import { Mail } from 'lucide-react';

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const name = formData.get('name') as string;
    const username = formData.get('username') as string;
    const displayUsername = formData.get('displayUsername') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await signUp.email({
        email,
        password,
        name,
        username: username || undefined,
        displayUsername: displayUsername || undefined,
        // Users will be redirected to /verify after clicking the verification link
        callbackURL: '/verify',
      });

      setSuccess(true);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center'>
              <Mail className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription>
                We&apos;ve sent you a verification link
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Alert>
            <Mail className='h-4 w-4' />
            <AlertTitle>Verification Email Sent</AlertTitle>
            <AlertDescription>
              Please check your email inbox and click the verification link to
              activate your account. The link will expire in 24 hours.
            </AlertDescription>
          </Alert>

          <div className='space-y-2'>
            <p className='text-sm text-muted-foreground'>
              Didn&apos;t receive the email?
            </p>
            <ul className='text-sm text-muted-foreground list-disc list-inside space-y-1'>
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>

          <div className='pt-4 border-t'>
            <Button
              variant='outline'
              onClick={() => router.push('/login')}
              className='w-full'
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='name'>Full Name</Label>
            <Input
              id='name'
              name='name'
              type='text'
              placeholder='John Doe'
              required
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
              type='email'
              placeholder='email@example.com'
              required
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='username'>Username (Optional)</Label>
            <Input
              id='username'
              name='username'
              type='text'
              placeholder='johndoe'
              disabled={isLoading}
            />
            <p className='text-xs text-muted-foreground'>
              Choose a username to sign in with username and password
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='displayUsername'>Display Username (Optional)</Label>
            <Input
              id='displayUsername'
              name='displayUsername'
              type='text'
              placeholder='John Doe'
              disabled={isLoading}
            />
            <p className='text-xs text-muted-foreground'>
              How your username will be displayed (defaults to your name)
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              name='password'
              type='password'
              required
              minLength={8}
              disabled={isLoading}
            />
            <p className='text-xs text-muted-foreground'>
              Must be at least 8 characters long
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              required
              disabled={isLoading}
            />
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
