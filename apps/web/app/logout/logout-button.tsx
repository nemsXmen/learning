'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@app/ui';

/**
 * A POST, never a GET: a link that signs someone out can be triggered by any
 * image tag on any site.
 */
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      size="lg"
      loading={pending}
      onClick={async () => {
        setPending(true);
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
      }}
    >
      Confirmer la déconnexion
    </Button>
  );
}
