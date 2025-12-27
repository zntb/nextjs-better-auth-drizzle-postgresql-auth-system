'use client';

import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

export function SocialAuthButtons() {
  return (
    <div className='grid gap-2'>
      <Button
        variant='outline'
        onClick={() => signIn.social({ provider: 'google' })}
      >
        Continue with Google
      </Button>

      <Button
        variant='outline'
        onClick={() => signIn.social({ provider: 'github' })}
      >
        Continue with GitHub
      </Button>

      <Button
        variant='outline'
        onClick={() => signIn.social({ provider: 'discord' })}
      >
        Continue with Discord
      </Button>
    </div>
  );
}
