// components/admin/session-management-actions.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { deleteSession } from '@/actions/admin-actions';
import { toast } from 'sonner';

interface Session {
  id: string;
  expiresAt: Date;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
  impersonatedBy: string | null;
}

interface SessionManagementActionsProps {
  session: Session;
  userId: string;
}

export function SessionManagementActions({
  session,
}: SessionManagementActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteSession = async () => {
    if (
      confirm(
        'Are you sure you want to delete this session? This will force the user to log in again.',
      )
    ) {
      setIsLoading(true);
      try {
        const result = await deleteSession(session.id);

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Session deleted successfully');
          window.location.reload();
        }
      } catch (error) {
        console.error('Session deletion error:', error);
        toast.error('An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0' disabled={isLoading}>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuItem
          onClick={handleDeleteSession}
          className='text-red-600'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete Session
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
