// components/admin/user-management-actions.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Ban,
  UserCheck,
  Trash2,
  Edit,
  Shield,
} from 'lucide-react';
import {
  blockUser,
  unblockUser,
  deleteUser,
  banUser,
  unbanUser,
} from '@/actions/admin-actions';
import type { User } from '@/actions/admin-actions';
import { toast } from 'sonner';

interface UserManagementActionsProps {
  user: User;
  currentUserId: string;
}

export function UserManagementActions({
  user,
  currentUserId,
}: UserManagementActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      let result;

      switch (action) {
        case 'block':
          result = await blockUser(user.id);
          break;
        case 'unblock':
          result = await unblockUser(user.id);
          break;
        case 'ban':
          result = await banUser(user.id, 'Admin action');
          break;
        case 'unban':
          result = await unbanUser(user.id);
          break;
        case 'delete':
          if (
            confirm(
              `Are you sure you want to delete ${user.email}? This action cannot be undone.`,
            )
          ) {
            result = await deleteUser(user.id);
          } else {
            setIsLoading(false);
            return;
          }
          break;
        default:
          setIsLoading(false);
          return;
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`User ${action}ed successfully`);
        window.location.reload();
      }
    } catch (error) {
      console.error('Action error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (user.id === currentUserId) {
    return (
      <div className='flex items-center space-x-2'>
        <Badge variant='outline'>You</Badge>
      </div>
    );
  }

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

        <DropdownMenuItem>
          <Edit className='mr-2 h-4 w-4' />
          Edit User
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {user.blocked === true ? (
          <DropdownMenuItem
            onClick={() => handleAction('unblock')}
            className='text-green-600'
          >
            <UserCheck className='mr-2 h-4 w-4' />
            Unblock User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => handleAction('block')}
            className='text-orange-600'
          >
            <Ban className='mr-2 h-4 w-4' />
            Block User
          </DropdownMenuItem>
        )}

        {user.banned ? (
          <DropdownMenuItem
            onClick={() => handleAction('unban')}
            className='text-green-600'
          >
            <Shield className='mr-2 h-4 w-4' />
            Unban User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => handleAction('ban')}
            className='text-red-600'
          >
            <Shield className='mr-2 h-4 w-4' />
            Ban User
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleAction('delete')}
          className='text-red-600'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
