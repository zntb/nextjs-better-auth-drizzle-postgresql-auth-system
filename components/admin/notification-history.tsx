'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Search,
  Clock,
  User,
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationLog {
  id: string;
  type: 'security' | 'general' | 'system';
  eventType: string;
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: Date;
  status: 'sent' | 'failed' | 'pending';
  message: string;
  details?: string;
}

interface NotificationHistoryProps {
  currentUserRole?: string;
}

export function NotificationHistory({
  currentUserRole,
}: NotificationHistoryProps) {
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set());

  // Mock notification logs with static timestamps
  const mockLogs: NotificationLog[] = [
    {
      id: '1',
      type: 'security',
      eventType: '2fa_enabled',
      userId: 'user1',
      userEmail: 'user1@example.com',
      userName: 'John Doe',
      timestamp: new Date('2025-12-29T07:29:42Z'),
      status: 'sent',
      message: 'Two-factor authentication enabled',
      details: 'User enabled 2FA on their account',
    },
    {
      id: '2',
      type: 'security',
      eventType: 'password_changed',
      userId: 'user2',
      userEmail: 'user2@example.com',
      userName: 'Jane Smith',
      timestamp: new Date('2025-12-29T05:52:47Z'),
      status: 'sent',
      message: 'Password changed successfully',
      details: 'User changed their account password',
    },
    {
      id: '3',
      type: 'general',
      eventType: 'email_verification',
      userId: 'user3',
      userEmail: 'user3@example.com',
      userName: 'Bob Wilson',
      timestamp: new Date('2025-12-29T03:52:47Z'),
      status: 'failed',
      message: 'Email verification failed',
      details: 'Failed to send verification email - SMTP connection timeout',
    },
    {
      id: '4',
      type: 'system',
      eventType: 'test_notification',
      userId: 'admin1',
      userEmail: 'admin@example.com',
      userName: 'Admin User',
      timestamp: new Date('2025-12-29T01:52:47Z'),
      status: 'sent',
      message: 'Test notification from admin panel',
      details: 'Admin sent a test notification to verify system functionality',
    },
    {
      id: '5',
      type: 'general',
      eventType: 'weekly_digest',
      userId: 'user4',
      userEmail: 'user4@example.com',
      userName: 'Alice Brown',
      timestamp: new Date('2025-12-28T07:52:47Z'),
      status: 'pending',
      message: 'Weekly activity summary',
      details: 'Scheduled weekly digest email',
    },
  ];

  useEffect(() => {
    const loadNotificationLogs = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setNotificationLogs(mockLogs);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to load notification logs:', error);
        toast.error('Failed to load notification logs');
        setLoading(false);
      }
    };

    loadNotificationLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLogs = useMemo(() => {
    let filtered = notificationLogs;

    if (searchTerm) {
      filtered = filtered.filter(
        log =>
          log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.eventType.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(log => log.status === filterStatus);
    }

    return filtered;
  }, [notificationLogs, searchTerm, filterType, filterStatus]);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'destructive' | 'secondary' | 'outline'
    > = {
      sent: 'default',
      failed: 'destructive',
      pending: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className='text-xs'>
        {status}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <AlertTriangle className='h-4 w-4 text-red-600' />;
      case 'system':
        return <Info className='h-4 w-4 text-blue-600' />;
      default:
        return <Bell className='h-4 w-4 text-gray-600' />;
    }
  };

  const toggleDetails = (logId: string) => {
    setShowDetails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Type', 'Event', 'User', 'Email', 'Status', 'Message'].join(','),
      ...filteredLogs.map(log =>
        [
          log.timestamp.toISOString(),
          log.type,
          log.eventType,
          log.userName,
          log.userEmail,
          log.status,
          `"${log.message.replace(/"/g, '""')}"`,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-logs-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (currentUserRole !== 'admin') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Bell className='h-5 w-5' />
            <span>Notification History</span>
          </CardTitle>
          <CardDescription>
            View your notification history and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            Notification history is only available for administrators.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center space-x-2'>
              <Bell className='h-5 w-5' />
              <span>Notification History</span>
              <Badge variant='secondary'>{filteredLogs.length}</Badge>
            </CardTitle>
            <CardDescription>
              View and manage notification delivery history
            </CardDescription>
          </div>
          <div className='flex space-x-2'>
            <Button variant='outline' size='sm' onClick={exportLogs}>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => window.location.reload()}
            >
              <RefreshCw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1 space-y-2'>
            <Label htmlFor='search'>Search</Label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                id='search'
                placeholder='Search by user, email, or message...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label>Type</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='security'>Security</SelectItem>
                <SelectItem value='general'>General</SelectItem>
                <SelectItem value='system'>System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className='w-[120px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='sent'>Sent</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <RefreshCw className='h-6 w-6 animate-spin' />
            <span className='ml-2'>Loading notification logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className='text-center py-8'>
            <Bell className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <p className='text-muted-foreground'>No notification logs found</p>
          </div>
        ) : (
          <ScrollArea className='h-[400px] pr-4'>
            <div className='space-y-3'>
              {filteredLogs.map(log => (
                <div key={log.id} className='border rounded-lg p-4 space-y-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-3'>
                      {getTypeIcon(log.type)}
                      <div className='space-y-1'>
                        <div className='flex items-center space-x-2'>
                          <span className='font-medium text-sm'>
                            {log.message}
                          </span>
                          {getStatusBadge(log.status)}
                        </div>
                        <div className='flex items-center space-x-4 text-xs text-muted-foreground'>
                          <span className='flex items-center space-x-1'>
                            <User className='h-3 w-3' />
                            <span>
                              {log.userName} ({log.userEmail})
                            </span>
                          </span>
                          <span className='flex items-center space-x-1'>
                            <Clock className='h-3 w-3' />
                            <span>{log.timestamp.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleDetails(log.id)}
                    >
                      {showDetails.has(log.id) ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>

                  {showDetails.has(log.id) && (
                    <div className='pt-3 border-t space-y-2'>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Event Type
                          </Label>
                          <p className='font-mono text-xs'>{log.eventType}</p>
                        </div>
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Timestamp
                          </Label>
                          <p className='font-mono text-xs'>
                            {log.timestamp.toISOString()}
                          </p>
                        </div>
                      </div>
                      {log.details && (
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Details
                          </Label>
                          <p className='text-sm mt-1'>{log.details}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
