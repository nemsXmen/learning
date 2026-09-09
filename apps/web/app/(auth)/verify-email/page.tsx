import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmail } from './verify-email';

export const metadata: Metadata = { title: 'Confirmation de l’adresse' };

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
