// app/(auth)/verify/page.tsx
import { Suspense } from 'react';
import { VerifyForm } from '@/components/auth/verify-form';

function VerifyFormWrapper() {
  return <VerifyForm />;
}

export default function VerifyPage() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md'>
        <Suspense
          fallback={
            <div className='animate-pulse space-y-4'>
              <div className='h-48 bg-gray-200 rounded-lg'></div>
            </div>
          }
        >
          <VerifyFormWrapper />
        </Suspense>
      </div>
    </div>
  );
}
