// components/auth/add-password-dialog.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { addPasswordToOAuthAccount } from '@/actions/add-password-for-oauth';
import { toast } from 'sonner';

interface AddPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: string[];
  onSuccess?: () => void;
}

export function AddPasswordDialog({
  open,
  onOpenChange,
  providers,
  onSuccess,
}: AddPasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const result = await addPasswordToOAuthAccount(password);

      if (result.error) {
        setError(result.error);
      } else {
        toast.success('Password added successfully!', {
          description: 'You can now enable two-factor authentication.',
        });
        // Reset form
        setPassword('');
        setConfirmPassword('');
        setError('');
        onOpenChange(false);

        // Refresh the page to update the UI
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to add password authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center'>
            <Key className='h-5 w-5 mr-2' />
            Add Password Authentication
          </DialogTitle>
          <DialogDescription>
            Set a password to enable two-factor authentication for your account.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <CheckCircle className='h-4 w-4' />
          <AlertTitle>Why add a password?</AlertTitle>
          <AlertDescription className='space-y-2'>
            <p>
              Your account currently uses {providers.join(', ')} for
              authentication. To enable 2FA, you need to add password
              authentication.
            </p>
            <p className='text-xs'>
              Don't worry - you'll still be able to sign in with{' '}
              {providers.join(', ')}.
            </p>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* New Password */}
          <div className='space-y-2'>
            <Label htmlFor='newPassword'>New Password</Label>
            <div className='relative'>
              <Input
                id='newPassword'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder='Choose a strong password'
                minLength={8}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>
              Must be at least 8 characters long
            </p>
          </div>

          {/* Confirm Password */}
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <div className='relative'>
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder='Confirm your password'
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {/* Password strength indicator */}
          {password.length > 0 && (
            <div className='space-y-1'>
              <div className='flex items-center space-x-2'>
                <div
                  className={`h-1 flex-1 rounded-full ${
                    password.length < 8
                      ? 'bg-red-500'
                      : password.length < 12
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
              </div>
              <p className='text-xs text-muted-foreground'>
                Password strength:{' '}
                {password.length < 8
                  ? 'Too short'
                  : password.length < 12
                  ? 'Good'
                  : 'Strong'}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={
                isLoading ||
                !password ||
                !confirmPassword ||
                password.length < 8
              }
            >
              {isLoading ? 'Adding Password...' : 'Add Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
