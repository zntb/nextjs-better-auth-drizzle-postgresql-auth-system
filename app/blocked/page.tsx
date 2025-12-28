'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, Home, Mail } from 'lucide-react';
import Link from 'next/link';

export default function BlockedPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <AlertTriangle className='h-12 w-12 text-destructive' />
          </div>
          <CardTitle className='text-2xl font-bold text-destructive'>
            Access Blocked
          </CardTitle>
          <CardDescription>
            Your account has been blocked by an administrator
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='text-center text-sm text-muted-foreground'>
            <p>
              If you believe this is an error or you need your account restored,
              please contact our support team.
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-2'>
            <Button asChild className='flex-1'>
              <Link href='/'>
                <Home className='mr-2 h-4 w-4' />
                Go Home
              </Link>
            </Button>

            <Button variant='outline' asChild className='flex-1'>
              <Link href='mailto:support@example.com'>
                <Mail className='mr-2 h-4 w-4' />
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
