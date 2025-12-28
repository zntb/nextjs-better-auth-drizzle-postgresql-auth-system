// app/admin/sessions/page.tsx
import React from 'react';
import { getCurrentUser } from '@/actions/auth-actions';
import { db } from '@/lib/db';
import { user, session } from '@/lib/db/schema';
import { count, eq, desc, gte } from 'drizzle-orm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, Shield, Activity, Clock } from 'lucide-react';
import { SessionManagementActions } from '@/components/admin/session-management-actions';

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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

  // Await searchParams in Next.js 13+ app router
  const resolvedSearchParams = await searchParams;

  // Get sessions data
  const currentPage = parseInt(resolvedSearchParams.page as string) || 1;
  const pageSize = parseInt(resolvedSearchParams.pageSize as string) || 10; // Set to 10 as default
  const offset = (currentPage - 1) * pageSize;

  const sessionsData = await db
    .select({
      session: session,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(session)
    .leftJoin(user, eq(session.userId, user.id))
    .orderBy(desc(session.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Calculate session statistics
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalSessionsCount,
    activeSessions,
    sessions24h,
    sessions7d,
    uniqueUsers,
  ] = await Promise.all([
    db.select({ count: count() }).from(session),
    db
      .select({ count: count() })
      .from(session)
      .where(gte(session.createdAt, last24Hours)),
    db
      .select({ count: count() })
      .from(session)
      .where(gte(session.createdAt, last24Hours)),
    db
      .select({ count: count() })
      .from(session)
      .where(gte(session.createdAt, last7Days)),
    db.select({ count: count() }).from(user),
  ]);

  const totalSessions = totalSessionsCount[0]?.count || 0;
  const totalPages = Math.ceil(totalSessions / pageSize);

  const stats = {
    totalSessions: totalSessions,
    activeSessions: activeSessions[0]?.count || 0,
    sessions24h: sessions24h[0]?.count || 0,
    sessions7d: sessions7d[0]?.count || 0,
    uniqueUsers: uniqueUsers[0]?.count || 0,
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Session Management
        </h1>
        <p className='text-muted-foreground'>
          Monitor and manage user authentication sessions across your
          application.
        </p>
      </div>

      {/* Session Statistics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Sessions
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalSessions}</div>
            <p className='text-xs text-muted-foreground'>All-time sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Sessions
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.activeSessions}</div>
            <p className='text-xs text-muted-foreground'>Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Sessions Today
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.sessions24h}</div>
            <p className='text-xs text-muted-foreground'>+5% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Sessions (7d)</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.sessions7d}</div>
            <p className='text-xs text-muted-foreground'>Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Unique Users</CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.uniqueUsers}</div>
            <p className='text-xs text-muted-foreground'>Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Sessions</CardTitle>
          <CardDescription>
            Find sessions by user email, IP address, or session ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center space-x-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input placeholder='Search sessions...' className='pl-10' />
            </div>
            <Button variant='outline'>Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sessions ({totalSessions})</CardTitle>
          <CardDescription>
            Recent authentication sessions across your application.
            {totalPages > 1 && (
              <span className='ml-2 text-xs bg-muted px-2 py-1 rounded'>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Session ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>User Agent</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className='w-[70px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionsData.map(sessionData => (
                <TableRow key={sessionData.session.id}>
                  <TableCell>
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                        <span className='text-xs font-medium text-primary'>
                          {sessionData.user?.name?.charAt(0) ||
                            sessionData.user?.email?.charAt(0) ||
                            'U'}
                        </span>
                      </div>
                      <div>
                        <div className='font-medium'>
                          {sessionData.user?.name || 'Unknown User'}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {sessionData.user?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='font-mono text-sm'>
                      {sessionData.session.id.slice(0, 12)}...
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='font-mono text-sm'>
                      {sessionData.session.ipAddress || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='max-w-[200px] truncate text-sm'>
                      {sessionData.session.userAgent || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(sessionData.session.createdAt!).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      sessionData.session.expiresAt!,
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <SessionManagementActions
                      session={sessionData.session}
                      userId={currentUser.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination - Show when there are sessions */}
          {totalSessions > 0 && (
            <div className='space-y-4'>
              {/* Session info and page size selector */}
              <div className='flex items-center justify-between space-x-2 py-4 border-t'>
                <div className='text-sm text-muted-foreground'>
                  <span className='font-medium'>
                    {offset + 1}-{Math.min(offset + pageSize, totalSessions)}
                  </span>{' '}
                  of {totalSessions} sessions
                  {totalPages > 1 && (
                    <span className='ml-2 text-xs bg-muted px-2 py-1 rounded'>
                      Page {currentPage}/{totalPages}
                    </span>
                  )}
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-muted-foreground'>
                    Per page:
                  </span>
                  <div className='flex space-x-1'>
                    {[10, 20, 50, 100].map(size => (
                      <a
                        key={size}
                        href={`?page=1&pageSize=${size}`}
                        className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                          pageSize === size
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted border-border'
                        }`}
                      >
                        {size}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={`?page=${Math.max(
                          1,
                          currentPage - 1,
                        )}&pageSize=${pageSize}`}
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // For smaller number of pages, show all pages
                        if (totalPages <= 7) return true;
                        // For larger numbers, show first, last, current, and adjacent pages
                        return (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const showEllipsis =
                          index > 0 && page - array[index - 1] > 1;

                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <PaginationItem>
                                <span className='flex size-9 items-center justify-center text-sm text-muted-foreground'>
                                  ...
                                </span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href={`?page=${page}&pageSize=${pageSize}`}
                                isActive={page === currentPage}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      })}

                    <PaginationItem>
                      <PaginationNext
                        href={`?page=${Math.min(
                          totalPages,
                          currentPage + 1,
                        )}&pageSize=${pageSize}`}
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
