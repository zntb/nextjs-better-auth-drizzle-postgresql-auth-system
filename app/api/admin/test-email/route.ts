import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/actions/auth-actions';
import { testSmtpConfiguration } from '@/lib/auth/email';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { smtpHost, smtpPort, smtpUser, smtpPassword, testEmail } = body;

    // Validate required fields
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !testEmail) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 },
      );
    }

    // Test SMTP configuration
    const result = await testSmtpConfiguration({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      user: smtpUser,
      password: smtpPassword,
      testEmail,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json(
      {
        error: 'Failed to test email configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
