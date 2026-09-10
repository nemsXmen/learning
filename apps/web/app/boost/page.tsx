import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, ErrorState, ProgressBar, toneForMastery } from '@app/ui';
import { getBoostPreview, type BoostPreview } from '../../lib/catalog';
import { requireUser } from '../../lib/auth-server';
import { StartBoost } from './start-boost';

export const metadata: Metadata = {
  title: 'Learning Boost',
  robots: { index: false, follow: false },
};

export default async function BoostPage() {
  await requireUser('/boost');

  let preview: BoostPreview;
  try {
    preview = await getBoostPreview();
  } catch {
    return (
      <Shell>
        <ErrorState
          title="Boost indisponible"
          description="Impossible de préparer une session pour l’instant. Réessaie dans un instant."
        />
      </Shell>
    );
  }

  // Nothing to reinforce is a state with its own next action (CDC §81).
  if (!preview.available) {
    return (
      <Shell>
        <Card quiet className="flex flex-col gap-3">
          <h1 className="font-display text-2xl font-semibold">Rien à renforcer</h1>
          <p className="text-sm text-text-muted">
            {preview.reason ?? 'Aucune compétence n’est en retard de révision.'}
          </p>
          <Link
            href="/learn"
            className="mt-2 inline-flex h-11 w-fit items-center rounded-control bg-accent px-5 text-sm font-semibold text-accent-on no-underline"
          >
            Continuer un parcours
          </Link>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-alt">
          Learning Boost
        </p>
        <h1 className="font-display text-3xl font-semibold">
          {preview.suggestedMinutes} minutes sur ce qui compte
        </h1>
        <p className="max-w-prose text-[15px] text-text-muted">
          Chaque question est choisie parce que tu l’as ratée, ou parce que tu ne l’as pas revue
          depuis longtemps.
        </p>
      </header>

      <Card className="flex flex-col gap-4">
        <p className="text-xs uppercase tracking-[0.08em] text-text-subtle">Ciblé par cette session</p>
        <ul className="flex list-none flex-col gap-3 p-0">
          {preview.targetSkills.map((skill) => (
            <li key={skill.id} className="flex flex-col gap-1.5">
              <ProgressBar
                value={skill.mastery}
                label={skill.name}
                tone={toneForMastery(skill.mastery)}
                showValue
              />
              <p className="text-xs text-text-subtle">{skill.reason}</p>
            </li>
          ))}
        </ul>
      </Card>

      <StartBoost suggestedMinutes={preview.suggestedMinutes} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-10 sm:px-8">{children}</main>
  );
}
