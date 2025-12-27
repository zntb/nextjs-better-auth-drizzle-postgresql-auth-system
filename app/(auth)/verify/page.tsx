// app/(auth)/verify/page.tsx
import { VerifyForm } from '@/components/auth/verify-form';

export default function VerifyPage() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md'>
        <VerifyForm />
      </div>
    </div>
  );
}
