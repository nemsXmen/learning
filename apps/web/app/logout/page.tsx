import type { Metadata } from 'next';
import { LogoutButton } from './logout-button';

export const metadata: Metadata = { title: 'Se déconnecter', robots: { index: false } };

export default function LogoutPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-5">
      <h1 className="font-display text-2xl font-semibold">Se déconnecter</h1>
      <p className="text-sm text-text-muted">
        Ta progression est conservée. Tu pourras reprendre à la prochaine connexion.
      </p>
      <LogoutButton />
    </main>
  );
}
