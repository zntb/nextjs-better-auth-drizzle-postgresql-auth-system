'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { ChangePasswordForm } from '@/components/auth/change-password-form';

export default function ChangePasswordPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);

  if (isPending) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center space-y-4'>
            <div className='h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto'></div>
            <p className='text-muted-foreground'>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    router.push('/login');
    return null;
  }

  const handleDialogClose = (open: boolean) => {
    setShowPasswordDialog(open);
    if (!open) {
      router.back();
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-md'>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Change Password</h1>
          <p className='text-muted-foreground'>
            Update your account password for better security
          </p>
        </div>

        <ChangePasswordForm
          open={showPasswordDialog}
          onOpenChange={handleDialogClose}
        />
      </div>
    </div>
  );
}
