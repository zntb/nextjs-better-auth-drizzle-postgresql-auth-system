'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
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

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signIn.email({
        email,
        password,
      });
      router.push('/');
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className='space-y-4'>
          {error && (
            <div className='p-3 text-sm text-red-500 bg-red-50 rounded-md'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='email'>Email or Username</Label>
            <Input
              id='email'
              name='email'
              type='text'
              placeholder='email@example.com'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input id='password' name='password' type='password' required />
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
