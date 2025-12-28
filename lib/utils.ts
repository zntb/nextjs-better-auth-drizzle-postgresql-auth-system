import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Type for the current user from getCurrentUser()
export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  emailNotificationsEnabled?: boolean | null;
  securityAlertsEnabled?: boolean | null;
};

// Type expected by sendNotificationIfEnabled
export type NotificationUser = {
  id: string;
  email: string;
  name: string;
  emailNotificationsEnabled?: boolean;
  securityAlertsEnabled?: boolean;
};

// Helper function to normalize user object for notification functions
export function normalizeUserForNotifications(
  user: CurrentUser,
): NotificationUser {
  return {
    ...user,
    emailNotificationsEnabled: user.emailNotificationsEnabled ?? false,
    securityAlertsEnabled: user.securityAlertsEnabled ?? false,
  };
}
