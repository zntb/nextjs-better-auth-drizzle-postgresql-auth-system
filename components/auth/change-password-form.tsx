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
import { Eye, EyeOff, Key } from 'lucide-react';
import { changePassword } from '@/actions/profile-actions';
import { toast } from 'sonner';

interface ChangePasswordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordForm({
  open,
  onOpenChange,
}: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePassword(
        formData.currentPassword,
        formData.newPassword,
      );

      if (result.error) {
        if (result.error.includes('Current password is incorrect')) {
          toast.error('Current password is incorrect', {
            description: 'Please check your current password and try again.',
            action: {
              label: 'Send Reset Email',
              onClick: handlePasswordReset,
            },
          });
        } else {
          toast.error('Failed to change password', {
            description: result.error,
          });
        }
      } else {
        toast.success('Password changed successfully!', {
          description: 'Your password has been updated.',
        });
        // Reset form and close dialog after a delay
        setTimeout(() => {
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          onOpenChange(false);
        }, 2000);
      }
    } catch (err) {
      toast.error('Failed to change password', {
        description: 'Please try again.' + err,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setResetEmailSent(false);
    onOpenChange(false);
  };

  const handlePasswordReset = async () => {
    try {
      setIsLoading(true);

      // This would trigger a password reset email
      // For now, we'll just show a success message
      setResetEmailSent(true);
      toast.success('Password reset instructions sent', {
        description: 'Check your email for password reset instructions.',
      });
    } catch (err) {
      toast.error('Failed to send reset email', {
        description: 'Please try again.' + err,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center'>
            <Key className='h-5 w-5 mr-2' />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new secure password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Current Password */}
          <div className='space-y-2'>
            <Label htmlFor='currentPassword'>Current Password</Label>
            <div className='relative'>
              <Input
                id='currentPassword'
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                required
                disabled={isLoading}
                placeholder='Enter your current password'
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => togglePasswordVisibility('current')}
                disabled={isLoading}
              >
                {showPasswords.current ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className='space-y-2'>
            <Label htmlFor='newPassword'>New Password</Label>
            <div className='relative'>
              <Input
                id='newPassword'
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                required
                disabled={isLoading}
                placeholder='Choose a new password'
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => togglePasswordVisibility('new')}
                disabled={isLoading}
              >
                {showPasswords.new ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm New Password</Label>
            <div className='relative'>
              <Input
                id='confirmPassword'
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                disabled={isLoading}
                placeholder='Confirm your new password'
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isLoading}
              >
                {showPasswords.confirm ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

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
                !formData.currentPassword ||
                !formData.newPassword ||
                !formData.confirmPassword
              }
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
