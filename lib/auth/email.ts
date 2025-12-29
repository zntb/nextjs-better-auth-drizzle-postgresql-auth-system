// lib/auth/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, url: string) {
  // The url parameter from Better Auth is the complete verification URL
  // Format: http://localhost:3000/api/auth/verify-email?token=xxx&callbackURL=/verify
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify your email address',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin: 20px 0;">
            <h1 style="color: #2c3e50; margin-top: 0;">Welcome to AuthApp!</h1>
            <p style="font-size: 16px; color: #555;">
              Thank you for signing up. To complete your registration, please verify your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" 
                 style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Verify Email Address
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #3b82f6; word-break: break-all; background-color: #f1f5f9; padding: 10px; border-radius: 4px;">
              ${url}
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 13px; color: #888; margin: 5px 0;">
                <strong>What happens next?</strong>
              </p>
              <ol style="font-size: 13px; color: #666; padding-left: 20px;">
                <li>Click the verification link above</li>
                <li>Your email will be verified</li>
                <li>Sign in with your credentials to access your account</li>
              </ol>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, url: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin: 20px 0;">
            <h1 style="color: #2c3e50; margin-top: 0;">Reset Your Password</h1>
            <p style="font-size: 16px; color: #555;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" 
                 style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #3b82f6; word-break: break-all; background-color: #f1f5f9; padding: 10px; border-radius: 4px;">
              ${url}
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendMagicLinkEmail(email: string, url: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your magic link to sign in',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sign In to AuthApp</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin: 20px 0;">
            <h1 style="color: #2c3e50; margin-top: 0;">Sign In to AuthApp</h1>
            <p style="font-size: 16px; color: #555;">
              Click the button below to securely sign in to your account:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" 
                 style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Sign In
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #3b82f6; word-break: break-all; background-color: #f1f5f9; padding: 10px; border-radius: 4px;">
              ${url}
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              This link will expire in 10 minutes. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendSecurityAlertEmail(
  email: string,
  userName: string,
  eventType: string,
  details?: string,
) {
  const getEventTitle = (type: string) => {
    switch (type) {
      case 'password_changed':
        return 'Password Changed';
      case 'username_changed':
        return 'Username Changed';
      case '2fa_enabled':
        return 'Two-Factor Authentication Enabled';
      case '2fa_disabled':
        return 'Two-Factor Authentication Disabled';
      case 'password_auth_enabled':
        return 'Password Authentication Enabled';
      case 'password_auth_disabled':
        return 'Password Authentication Disabled';
      case 'login_method_changed':
        return 'Login Method Changed';
      case 'notifications_enabled':
        return 'Email Notifications Enabled';
      case 'security_alerts_enabled':
        return 'Security Alerts Enabled';
      default:
        return 'Security Alert';
    }
  };

  const getEventDescription = (type: string, detail?: string) => {
    switch (type) {
      case 'password_changed':
        return 'Your account password has been successfully changed.';
      case 'username_changed':
        return `Your username has been changed to: ${detail}`;
      case '2fa_enabled':
        return 'Two-factor authentication has been enabled on your account.';
      case '2fa_disabled':
        return 'Two-factor authentication has been disabled on your account.';
      case 'password_auth_enabled':
        return 'Password authentication has been enabled on your account.';
      case 'password_auth_disabled':
        return 'Password authentication has been disabled on your account.';
      case 'login_method_changed':
        return `Your default login method has been changed to: ${detail}`;
      case 'notifications_enabled':
        return 'Email notifications have been enabled for your account.';
      case 'security_alerts_enabled':
        return 'Security alerts have been enabled for your account.';
      default:
        return 'A security-related change has been made to your account.';
    }
  };

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Security Alert: ${getEventTitle(eventType)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Security Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <div style="background-color: #dc2626; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                <svg width="20" height="20" fill="white" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">Security Alert</h1>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">${getEventTitle(
                  eventType,
                )}</p>
              </div>
            </div>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
              Hello ${userName},
            </p>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
              ${getEventDescription(eventType, details)}
            </p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="font-size: 14px; color: #991b1b; margin: 0; font-weight: 600;">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style="vertical-align: middle; margin-right: 5px;">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                If you didn't make this change, please contact support immediately.
              </p>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              This is an automated security notification. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

// Helper function to check if user wants notifications and send them
export async function sendNotificationIfEnabled(
  user: {
    id: string;
    email: string;
    name: string;
    emailNotificationsEnabled?: boolean;
    securityAlertsEnabled?: boolean;
  },
  notificationType: 'security' | 'general',
  eventType: string,
  details?: string,
) {
  try {
    // Check if user has enabled the relevant notifications
    const shouldSendNotification =
      (notificationType === 'security' && user.securityAlertsEnabled) ||
      (notificationType === 'general' && user.emailNotificationsEnabled);

    if (!shouldSendNotification) {
      console.log(
        `Notification skipped for user ${user.email} - ${notificationType} notifications disabled`,
      );
      return;
    }

    // Send the appropriate email
    if (notificationType === 'security') {
      await sendSecurityAlertEmail(user.email, user.name, eventType, details);
    } else {
      // For general notifications, we can extend this later
      console.log(`General notification would be sent to ${user.email}`);
    }

    console.log(
      `${notificationType} notification sent to ${user.email} for ${eventType}`,
    );
  } catch (error) {
    console.error(
      `Failed to send ${notificationType} notification to ${user.email}:`,
      error,
    );
    // Don't throw error to avoid breaking the main flow
  }
}

export async function sendNotificationPreferenceUpdateEmail(
  email: string,
  userName: string,
  preferenceType: string,
  enabled: boolean,
) {
  const getPreferenceTitle = (type: string) => {
    switch (type) {
      case 'email_notifications':
        return 'Email Notifications';
      case 'security_alerts':
        return 'Security Alerts';
      default:
        return 'Notifications';
    }
  };

  const getPreferenceDescription = (type: string, isEnabled: boolean) => {
    const status = isEnabled ? 'enabled' : 'disabled';
    switch (type) {
      case 'email_notifications':
        return `Email notifications have been ${status} for your account. You will ${
          isEnabled ? 'now receive' : 'no longer receive'
        } notifications via email.`;
      case 'security_alerts':
        return `Security alerts have been ${status} for your account. You will ${
          isEnabled ? 'now receive' : 'no longer receive'
        } security-related notifications.`;
      default:
        return `Your ${getPreferenceTitle(
          type,
        ).toLowerCase()} preference has been ${status}.`;
    }
  };

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Notification Preference Updated: ${getPreferenceTitle(
      preferenceType,
    )}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notification Preferences Updated</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <div style="background-color: #3b82f6; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                <svg width="20" height="20" fill="white" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
                </svg>
              </div>
              <div>
                <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">Notification Preferences</h1>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Preferences Updated</p>
              </div>
            </div>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
              Hello ${userName},
            </p>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
              ${getPreferenceDescription(preferenceType, enabled)}
            </p>
            
            <div style="background-color: ${
              enabled ? '#ecfdf5' : '#fef2f2'
            }; border: 1px solid ${
      enabled ? '#bbf7d0' : '#fecaca'
    }; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="font-size: 14px; color: ${
                enabled ? '#065f46' : '#991b1b'
              }; margin: 0;">
                <strong>Current Status:</strong> ${
                  enabled ? 'Enabled' : 'Disabled'
                }
              </p>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              You can update your notification preferences anytime in your account settings.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  testEmail: string;
}

export async function testSmtpConfiguration(config: SmtpConfig) {
  try {
    // Create a test transporter with the provided configuration
    const testTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465, // true for 465, false for other ports
      auth: {
        user: config.user,
        pass: config.password,
      },
    });

    // Test the connection by verifying it
    await testTransporter.verify();

    // Send a test email
    const testEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Configuration Test</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f0f9ff; border-radius: 10px; padding: 30px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <div style="background-color: #3b82f6; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                <svg width="20" height="20" fill="white" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
                </svg>
              </div>
              <div>
                <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">Email Configuration Test</h1>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Success</p>
              </div>
            </div>
            
            <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
              This is a test email to confirm your SMTP configuration is working correctly.
            </p>
            
            <div style="background-color: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="font-size: 14px; color: #065f46; margin: 0;">
                <strong>Configuration Details:</strong><br/>
                Host: ${config.host}<br/>
                Port: ${config.port}<br/>
                User: ${config.user}
              </p>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              This is an automated test email. Your email configuration is working properly!
            </p>
          </div>
        </body>
      </html>
    `;

    await testTransporter.sendMail({
      from: config.user, // Use the SMTP user as the sender
      to: config.testEmail,
      subject: 'Email Configuration Test - Success!',
      html: testEmailHtml,
    });

    return {
      success: true,
      message: 'Email configuration test successful! Test email sent.',
      details: {
        host: config.host,
        port: config.port,
        user: config.user,
      },
    };
  } catch (error) {
    console.error('SMTP configuration test failed:', error);

    // Provide specific error messages for common issues
    let errorMessage = 'Failed to test email configuration';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message;

      // Add helpful context based on error type
      if (error.message.includes('ECONNREFUSED')) {
        errorDetails =
          'Cannot connect to SMTP server. Please check the host and port.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorDetails = 'DNS resolution failed. Please check the host address.';
      } else if (error.message.includes('Authentication')) {
        errorDetails =
          'Authentication failed. Please check username and password.';
      } else if (error.message.includes('Timeout')) {
        errorDetails = 'Connection timeout. Please check the host and port.';
      }
    }

    return {
      success: false,
      error: errorMessage,
      details: errorDetails || 'Please check your SMTP configuration.',
    };
  }
}
