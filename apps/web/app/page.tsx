import Link from 'next/link';

/**
 * Placeholder. The real landing is features/14-public-landing; this exists so the
 * app boots end to end without pretending to be finished.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="font-display text-4xl font-semibold">Atelier</h1>
      <p className="text-text-muted">
        Infrastructure en place. La landing publique arrive avec la slice 14 ; le système visuel
        est déjà consultable.
      </p>
      <Link
        href="/design"
        className="inline-flex h-11 w-fit items-center rounded-control bg-accent px-5 text-sm font-semibold text-accent-on"
      >
        Ouvrir la galerie de composants
      </Link>
    </main>
  );
}
