// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/actions/auth-actions';
import { getPaginatedUsers } from '@/actions/admin-actions';
import type { User } from '@/actions/admin-actions';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, Edit } from 'lucide-react';
import { UserManagementActions } from '@/components/admin/user-management-actions';

type PaginationInfo = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type UsersResponse = {
  success?: boolean;
  users?: User[];
  pagination?: PaginationInfo;
  error?: string;
};

type CurrentUser = {
  id: string;
  role: string | null;
  email: string;
  name: string | null;
};

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user as CurrentUser);
      } catch (error) {
        console.error('Failed to load current user:', error);
      }
    };
    loadCurrentUser();
  }, []);

  // Load users when page or search term changes
  useEffect(() => {
    const loadUsers = async () => {
      if (!currentUser || currentUser.role !== 'admin') {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result: UsersResponse = await getPaginatedUsers({
          page: pagination.page,
          limit: pagination.limit,
          search: debouncedSearchTerm,
        });

        if (result.success && result.users && result.pagination) {
          setUsers(result.users);
          setPagination(result.pagination);
        } else {
          setUsers([]);
          setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
        }
      } catch (error) {
        console.error('Failed to load users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, pagination.page, debouncedSearchTerm]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when searching
  };

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
              <Input
                placeholder='Search users...'
                className='pl-10'
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
              />
            </div>
            <Button variant='outline'>Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Users ({loading ? '...' : pagination.totalCount})
          </CardTitle>
          <CardDescription>
            {debouncedSearchTerm
              ? `Search results for "${debouncedSearchTerm}"`
              : `A list of all users registered in your application.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-muted-foreground'>Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-muted-foreground'>
                {debouncedSearchTerm
                  ? 'No users found matching your search.'
                  : 'No users found.'}
              </div>
            </div>
          ) : (
            <>
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
                              {user.name?.charAt(0) ||
                                user.email?.charAt(0) ||
                                'U'}
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
                          variant={
                            user.role === 'admin' ? 'default' : 'secondary'
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-col space-y-1'>
                          <Badge
                            variant={
                              user.blocked === true
                                ? 'destructive'
                                : user.banned
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {user.blocked === true
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
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className='mt-6'>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href='#'
                          onClick={e => {
                            e.preventDefault();
                            if (pagination.hasPrevPage) {
                              handlePageChange(pagination.page - 1);
                            }
                          }}
                          className={
                            !pagination.hasPrevPage
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>

                      {/* Generate page numbers */}
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNumber;
                          if (pagination.totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNumber = i + 1;
                          } else if (
                            pagination.page >=
                            pagination.totalPages - 2
                          ) {
                            pageNumber = pagination.totalPages - 4 + i;
                          } else {
                            pageNumber = pagination.page - 2 + i;
                          }

                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                href='#'
                                onClick={e => {
                                  e.preventDefault();
                                  handlePageChange(pageNumber);
                                }}
                                isActive={pageNumber === pagination.page}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        },
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href='#'
                          onClick={e => {
                            e.preventDefault();
                            if (pagination.hasNextPage) {
                              handlePageChange(pagination.page + 1);
                            }
                          }}
                          className={
                            !pagination.hasNextPage
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  {/* Page info */}
                  <div className='text-sm text-muted-foreground text-center mt-2'>
                    Page {pagination.page} of {pagination.totalPages}
                    {debouncedSearchTerm && (
                      <span>
                        {' '}
                        (filtered from {pagination.totalCount} total users)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
