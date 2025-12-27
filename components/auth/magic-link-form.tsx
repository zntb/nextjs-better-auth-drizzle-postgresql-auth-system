'use client';

import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
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

export function MagicLinkForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, error } = await authClient.signIn.magicLink({
        email,
        name: name || undefined,
        callbackURL: '/dashboard',
      });

      if (error) {
        setError(error.message || 'Failed to send magic link');
      } else {
        setSuccess(true);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Magic Link</CardTitle>
        <CardDescription>
          Sign in with a magic link sent to your email
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className='p-4 text-sm text-green-700 bg-green-50 rounded-md'>
            Check your email for a magic link to sign in!
          </div>
        ) : (
          <form onSubmit={onSubmit} className='space-y-4'>
            {error && (
              <div className='p-3 text-sm text-red-500 bg-red-50 rounded-md'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='email@example.com'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='name'>Name (optional)</Label>
              <Input
                id='name'
                name='name'
                type='text'
                placeholder='Your name'
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
