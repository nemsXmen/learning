import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@app/ui';
import { requireUser } from '../../lib/auth-server';

/** Private surface: never indexed (CDC §61). */
export const metadata: Metadata = {
  title: 'Tableau de bord',
  robots: { index: false, follow: false },
};

/**
 * Placeholder. The real dashboard is features/13-dashboard-next-best-action; this
 * exists so the protected route is real and the session can be exercised.
 */
export default async function DashboardPage() {
  const user = await requireUser('/dashboard');

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Bonjour {user.displayName}</h1>
        <p className="mt-2 text-text-muted">
          Le tableau de bord arrive avec la slice 13. Ta session, elle, fonctionne.
        </p>
      </div>

      {!user.emailVerified ? (
        <Card quiet className="flex flex-col gap-2">
          <h2 className="font-display text-base font-semibold">Confirme ton adresse</h2>
          <p className="text-sm text-text-muted">
            Un lien a été envoyé à {user.email}. Il reste valable 24 heures.
          </p>
        </Card>
      ) : null}

      <p className="text-[13px] text-text-muted">
        <Link href="/logout">Se déconnecter</Link>
      </p>
    </main>
  );
}
