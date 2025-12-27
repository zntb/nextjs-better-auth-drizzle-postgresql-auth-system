// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';
import {
  magicLinkClient,
  twoFactorClient,
  usernameClient,
} from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [magicLinkClient(), twoFactorClient(), usernameClient()],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
