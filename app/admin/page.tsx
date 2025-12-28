// app/admin/page.tsx
import { getCurrentUser } from '@/actions/auth-actions';
import { db } from '@/lib/db';
import { user, session } from '@/lib/db/schema';
import { count, eq, desc } from 'drizzle-orm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, Shield, TrendingUp } from 'lucide-react';

export default async function AdminDashboard() {
  const currentUser = await getCurrentUser();

  // Get dashboard statistics
  const [totalUsers, totalSessions, blockedUsers, recentUsers, recentSessions] =
    await Promise.all([
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(session),
      db.select({ count: count() }).from(user).where(eq(user.blocked, true)),
      db.select().from(user).orderBy(desc(user.createdAt)).limit(5),
      db.select().from(session).orderBy(desc(session.createdAt)).limit(5),
    ]);

  const stats = {
    totalUsers: totalUsers[0]?.count || 0,
    totalSessions: totalSessions[0]?.count || 0,
    blockedUsers: blockedUsers[0]?.count || 0,
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Admin Dashboard</h1>
        <p className='text-muted-foreground'>
          Welcome back, {currentUser?.name || currentUser?.email}. Here's an
          overview of your application.
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalUsers}</div>
            <p className='text-xs text-muted-foreground'>
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Sessions
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalSessions}</div>
            <p className='text-xs text-muted-foreground'>+5% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Blocked Users</CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.blockedUsers}</div>
            <p className='text-xs text-muted-foreground'>-2% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Growth Rate</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>+8.2%</div>
            <p className='text-xs text-muted-foreground'>This month</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        {/* Recent Users */}
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentUsers.map(user => (
                <div
                  key={user.id}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                      <span className='text-xs font-medium text-primary'>
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className='text-sm font-medium leading-none'>
                        {user.name || 'Unnamed User'}
                      </p>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Badge variant={user.blocked ? 'destructive' : 'secondary'}>
                      {user.blocked ? 'Blocked' : 'Active'}
                    </Badge>
                    <Badge variant='outline'>{user.role}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Latest authentication activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentSessions.map(session => (
                <div
                  key={session.id}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center space-x-2'>
                    <Activity className='h-4 w-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium leading-none'>
                        Session {session.id.slice(-8)}
                      </p>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {session.ipAddress || 'Unknown IP'}
                      </p>
                    </div>
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    {new Date(session.createdAt!).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
