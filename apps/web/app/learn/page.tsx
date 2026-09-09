import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Card, EmptyState, ErrorState, ProgressBar } from '@app/ui';
import { listTechnologies, type TechnologySummary } from '../../lib/catalog';

export const metadata: Metadata = {
  title: 'Apprendre',
  robots: { index: false, follow: false },
};

export default async function LearnPage() {
  let technologies: TechnologySummary[];
  try {
    technologies = await listTechnologies();
  } catch {
    return (
      <Shell>
        <ErrorState
          title="Impossible de charger les parcours"
          description="Ta progression est intacte. C'est l'affichage de la liste qui a échoué."
        />
      </Shell>
    );
  }

  if (technologies.length === 0) {
    return (
      <Shell>
        <EmptyState
          title="Aucun parcours disponible"
          description="Le contenu n'a pas encore été publié. Reviens d'ici peu."
          action={{ label: 'Retour au tableau de bord', href: '/dashboard' }}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <ul className="grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {technologies.map((technology) => (
          <TechnologyCard key={technology.slug} technology={technology} />
        ))}
      </ul>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold">Apprendre</h1>
        <p className="mt-2 max-w-prose text-[15px] text-text-muted">
          Chaque parcours suit tes compétences, pas tes chapitres lus.
        </p>
      </header>
      {children}
    </main>
  );
}

function TechnologyCard({ technology }: { technology: TechnologySummary }) {
  const started = technology.progressPercent > 0;

  return (
    <Card as="li" emphasis={started} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">
            <Link href={`/learn/${technology.slug}`} className="text-text no-underline">
              {technology.name}
            </Link>
          </h2>
          <p className="mt-1 text-[13px] text-text-subtle">
            {technology.moduleCount} modules · {technology.chapterCount} chapitres
          </p>
        </div>
        {started ? <Badge tone="accent">En cours</Badge> : null}
      </div>

      <p className="text-sm leading-relaxed text-text-muted">{technology.description}</p>

      <ProgressBar
        value={technology.progressPercent}
        label={`Progression en ${technology.name}`}
        showValue
      />

      <p className="text-[13px] text-text-subtle">
        {technology.masteredSkillCount} / {technology.skillCount} compétences maîtrisées
      </p>

      <Link
        href={`/learn/${technology.slug}`}
        className="mt-auto inline-flex h-11 items-center justify-center rounded-control bg-accent px-4 text-sm font-semibold text-accent-on no-underline"
      >
        {started ? 'Reprendre' : 'Commencer'}
      </Link>
    </Card>
  );
}
