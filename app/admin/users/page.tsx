// app/admin/users/page.tsx
import { getCurrentUser } from '@/actions/auth-actions';
import { getAllUsers } from '@/actions/admin-actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Edit } from 'lucide-react';
import { UserManagementActions } from '@/components/admin/user-management-actions';

type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  twoFactorEnabled: boolean;
  username: string | null;
  displayUsername: string | null;
  blocked: boolean;
  emailPasswordEnabled: boolean;
  defaultLoginMethod: string;
  emailNotificationsEnabled: boolean;
  securityAlertsEnabled: boolean;
};

export default async function AdminUsersPage() {
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

  const usersResult = await getAllUsers();

  if (usersResult.error) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{usersResult.error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const users = (usersResult.users as User[]) || [];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>User Management</h1>
          <p className='text-muted-foreground'>
            Manage user accounts, permissions, and account status.
          </p>
        </div>
        <Button>
          <Edit className='mr-2 h-4 w-4' />
          Add New User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>
            Find users by name, email, or username
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input placeholder='Search users...' className='pl-10' />
            </div>
            <Button variant='outline'>Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
          <CardDescription>
            A list of all users registered in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className='w-[70px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                        <span className='text-xs font-medium text-primary'>
                          {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className='font-medium'>
                          {user.name || 'Unnamed User'}
                        </div>
                        {user.username && (
                          <div className='text-sm text-muted-foreground'>
                            @{user.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col space-y-1'>
                      <Badge
                        variant={
                          user.blocked
                            ? 'destructive'
                            : user.banned
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {user.blocked
                          ? 'Blocked'
                          : user.banned
                          ? 'Banned'
                          : 'Active'}
                      </Badge>
                      {user.twoFactorEnabled && (
                        <Badge variant='outline' className='text-xs'>
                          2FA Enabled
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt!).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <UserManagementActions
                      user={user}
                      currentUserId={currentUser.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
