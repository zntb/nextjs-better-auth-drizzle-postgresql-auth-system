import { MagicLinkForm } from '@/components/auth/magic-link-form';
import Link from 'next/link';

export default function MagicLinkPage() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-4'>
        <MagicLinkForm />

        <div className='text-center text-sm'>
          <Link href='/login' className='text-blue-600 hover:underline'>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
