// app/admin/analytics/page.tsx
import { getCurrentUser } from '@/actions/auth-actions';
import { db } from '@/lib/db';
import { user, session } from '@/lib/db/schema';
import { count, eq, gte, desc, sql } from 'drizzle-orm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Activity,
  TrendingUp,
  Shield,
  UserCheck,
  Clock,
  Globe,
} from 'lucide-react';

export default async function AdminAnalyticsPage() {
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

  // Calculate date ranges
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get analytics data
  const [
    totalUsers,
    activeUsers,
    newUsers24h,
    newUsers7d,
    totalSessions,
    activeSessions,
    newSessions24h,
    blockedUsers,
    bannedUsers,
    verifiedUsers,
    twoFactorUsers,
  ] = await Promise.all([
    // Total users
    db.select({ count: count() }).from(user),
    // Active users (users with recent sessions)
    db
      .select({ count: count() })
      .from(user)
      .leftJoin(session, eq(user.id, session.userId))
      .where(gte(session.createdAt!, last7Days)),
    // New users in last 24 hours
    db
      .select({ count: count() })
      .from(user)
      .where(gte(user.createdAt, last24Hours)),
    // New users in last 7 days
    db
      .select({ count: count() })
      .from(user)
      .where(gte(user.createdAt, last7Days)),
    // Total sessions
    db.select({ count: count() }).from(session),
    // Active sessions (sessions created in last 24 hours)
    db
      .select({ count: count() })
      .from(session)
      .where(gte(session.createdAt, last24Hours)),
    // New sessions in last 24 hours
    db
      .select({ count: count() })
      .from(session)
      .where(gte(session.createdAt, last24Hours)),
    // Blocked users
    db.select({ count: count() }).from(user).where(eq(user.blocked, true)),
    // Banned users
    db.select({ count: count() }).from(user).where(eq(user.banned, true)),
    // Verified users
    db
      .select({ count: count() })
      .from(user)
      .where(eq(user.emailVerified, true)),
    // 2FA enabled users
    db
      .select({ count: count() })
      .from(user)
      .where(eq(user.twoFactorEnabled, true)),
  ]);

  // Get user growth data for the last 7 days
  const userGrowthData = await db
    .select({
      date: sql<string>`DATE(${user.createdAt})`,
      count: count(),
    })
    .from(user)
    .where(gte(user.createdAt, last7Days))
    .groupBy(sql`DATE(${user.createdAt})`)
    .orderBy(desc(sql`DATE(${user.createdAt})`));

  // Get top countries (by IP address)
  const topLocations = await db
    .select({
      location: session.ipAddress,
      count: count(),
    })
    .from(session)
    .where(gte(session.createdAt, last7Days))
    .groupBy(session.ipAddress)
    .orderBy(desc(count()))
    .limit(5);

  const stats = {
    totalUsers: totalUsers[0]?.count || 0,
    activeUsers: activeUsers[0]?.count || 0,
    newUsers24h: newUsers24h[0]?.count || 0,
    newUsers7d: newUsers7d[0]?.count || 0,
    totalSessions: totalSessions[0]?.count || 0,
    activeSessions: activeSessions[0]?.count || 0,
    newSessions24h: newSessions24h[0]?.count || 0,
    blockedUsers: blockedUsers[0]?.count || 0,
    bannedUsers: bannedUsers[0]?.count || 0,
    verifiedUsers: verifiedUsers[0]?.count || 0,
    twoFactorUsers: twoFactorUsers[0]?.count || 0,
  };

  const growthRate24h =
    stats.totalUsers > 0
      ? ((stats.newUsers24h / stats.totalUsers) * 100).toFixed(1)
      : '0';
  const growthRate7d =
    stats.totalUsers > 0
      ? ((stats.newUsers7d / stats.totalUsers) * 100).toFixed(1)
      : '0';

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Analytics</h1>
        <p className='text-muted-foreground'>
          Comprehensive insights into your application's performance and user
          activity.
        </p>
      </div>

      {/* Key Metrics */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalUsers}</div>
            <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
              <div className='flex items-center'>
                <TrendingUp className='mr-1 h-3 w-3 text-green-500' />+
                {growthRate24h}% today
              </div>
              <div className='flex items-center'>
                <TrendingUp className='mr-1 h-3 w-3 text-green-500' />+
                {growthRate7d}% this week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Active Users (7d)
            </CardTitle>
            <UserCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.activeUsers}</div>
            <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
              <div className='flex items-center'>
                <Clock className='mr-1 h-3 w-3 text-blue-500' />
                Recent activity
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Sessions
            </CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalSessions}</div>
            <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
              <div className='flex items-center'>
                <TrendingUp className='mr-1 h-3 w-3 text-green-500' />+
                {stats.newSessions24h} today
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Security Status
            </CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {((stats.twoFactorUsers / stats.totalUsers) * 100).toFixed(0)}%
            </div>
            <p className='text-xs text-muted-foreground'>2FA adoption rate</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        {/* User Security Stats */}
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>User Security Overview</CardTitle>
            <CardDescription>
              Account security and verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <UserCheck className='h-4 w-4 text-green-500' />
                  <span className='text-sm font-medium'>Verified Users</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm font-bold'>
                    {stats.verifiedUsers}
                  </span>
                  <Badge variant='secondary'>
                    {((stats.verifiedUsers / stats.totalUsers) * 100).toFixed(
                      1,
                    )}
                    %
                  </Badge>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Shield className='h-4 w-4 text-blue-500' />
                  <span className='text-sm font-medium'>2FA Enabled</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm font-bold'>
                    {stats.twoFactorUsers}
                  </span>
                  <Badge variant='secondary'>
                    {((stats.twoFactorUsers / stats.totalUsers) * 100).toFixed(
                      1,
                    )}
                    %
                  </Badge>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Shield className='h-4 w-4 text-orange-500' />
                  <span className='text-sm font-medium'>Blocked Users</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm font-bold'>
                    {stats.blockedUsers}
                  </span>
                  <Badge variant='destructive'>
                    {((stats.blockedUsers / stats.totalUsers) * 100).toFixed(1)}
                    %
                  </Badge>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Shield className='h-4 w-4 text-red-500' />
                  <span className='text-sm font-medium'>Banned Users</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-sm font-bold'>{stats.bannedUsers}</span>
                  <Badge variant='destructive'>
                    {((stats.bannedUsers / stats.totalUsers) * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>User Growth (7 days)</CardTitle>
            <CardDescription>Daily new user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {userGrowthData.map((data, index) => (
                <div key={index} className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    <div className='w-2 h-2 bg-primary rounded-full'></div>
                    <span className='text-sm font-medium'>
                      {new Date(data.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className='text-sm font-bold'>{data.count}</span>
                    <TrendingUp className='h-3 w-3 text-green-500' />
                  </div>
                </div>
              ))}
              {userGrowthData.length === 0 && (
                <div className='text-center text-muted-foreground py-4'>
                  No new users in the last 7 days
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Data */}
      <Card>
        <CardHeader>
          <CardTitle>Top Locations (7 days)</CardTitle>
          <CardDescription>
            Most active locations by session count
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-5'>
            {topLocations.map((location, index) => (
              <div key={index} className='flex items-center space-x-3'>
                <Globe className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>
                    {location.location || 'Unknown'}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {location.count} sessions
                  </p>
                </div>
              </div>
            ))}
            {topLocations.length === 0 && (
              <div className='col-span-5 text-center text-muted-foreground py-4'>
                No location data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
