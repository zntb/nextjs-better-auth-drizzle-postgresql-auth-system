import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import Link from 'next/link';

function LoginFormWrapper() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-4'>
        <Suspense
          fallback={
            <div className='animate-pulse space-y-4'>
              <div className='h-32 bg-gray-200 rounded-lg'></div>
            </div>
          }
        >
          <LoginFormWrapper />
        </Suspense>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-white px-2 text-gray-500'>
              Or continue with
            </span>
          </div>
        </div>

        <SocialAuthButtons />

        <div className='text-center text-sm space-y-2'>
          <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3'>
            <Link
              href='/magic-link'
              className='text-blue-600 hover:underline font-medium'
            >
              🔗 Sign in with magic link instead
            </Link>
            <p className='text-xs text-blue-600 mt-1'>
              Passwordless authentication for enhanced security
            </p>
          </div>
          <div>
            Don&apos;t have an account?{' '}
            <Link href='/register' className='text-blue-600 hover:underline'>
              Sign up
            </Link>
          </div>
          <div>
            <Link
              href='/forgot-password'
              className='text-blue-600 hover:underline'
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
