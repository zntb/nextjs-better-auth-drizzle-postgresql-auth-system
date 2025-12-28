// lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, magicLink, twoFactor, username } from 'better-auth/plugins';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMagicLinkEmail,
} from './auth/email';

export const auth = betterAuth({
  appName: 'Next.js Auth System',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
    sendOnSignUp: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github', 'discord'],
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
      expiresIn: 600,
      disableSignUp: false,
    }),
    admin(),
    twoFactor({
      skipVerificationOnEnable: false, // Require TOTP verification after enabling
    }),
    username(),
  ],
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
      },
      blocked: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
      username: {
        type: 'string',
        required: false,
      },
      twoFactorEnabled: {
        type: 'boolean',
        required: false,
        defaultValue: false,
      },
      emailPasswordEnabled: {
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
      defaultLoginMethod: {
        type: 'string',
        required: false,
        defaultValue: 'email',
      },
      emailNotificationsEnabled: {
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
      securityAlertsEnabled: {
        type: 'boolean',
        required: false,
        defaultValue: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
