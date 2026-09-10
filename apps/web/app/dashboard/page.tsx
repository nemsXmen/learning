import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Card, ErrorState, ProgressBar, ProgressRing, toneForMastery } from '@app/ui';
import { getDashboard, type DashboardView } from '../../lib/catalog';
import { requireUser } from '../../lib/auth-server';

/** Private surface: never indexed (CDC §61). */
export const metadata: Metadata = {
  title: 'Tableau de bord',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await requireUser('/dashboard');

  let view: DashboardView;
  try {
    view = await getDashboard();
  } catch {
    return (
      <Shell>
        <ErrorState
          title="Tableau de bord indisponible"
          description="Ta progression est intacte. Réessaie dans un instant."
        />
      </Shell>
    );
  }

  const newcomer = view.overallProgressPercent === 0 && !view.continue;

  return (
    <Shell>
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Bonjour {user.displayName}</h1>
          {/* Credible and specific, never "TU ES INCROYABLE" (CDC §78). */}
          <p className="mt-2 max-w-prose text-[15px] text-text-muted">
            {newcomer
              ? 'Choisis un parcours et commence par un chapitre. Le reste s’adapte.'
              : view.nextBestAction.reason}
          </p>
        </div>
        <Stats view={view} />
      </header>

      {!view.user.emailVerified ? (
        <Card quiet className="flex flex-col gap-1">
          <h2 className="font-display text-base font-semibold">Confirme ton adresse</h2>
          <p className="text-sm text-text-muted">
            Un lien t’a été envoyé. Il reste valable 24 heures.
          </p>
        </Card>
      ) : null}

      <NextBestAction view={view} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Continue view={view} />
        <Attention view={view} />
      </div>

      <TodayPlan view={view} />
      <Technologies view={view} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10 sm:px-8">{children}</main>
  );
}

function Stats({ view }: { view: DashboardView }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {view.streak ? (
        <Badge tone={view.streak.activeToday ? 'accent' : 'neutral'}>
          {view.streak.currentDays} jour{view.streak.currentDays > 1 ? 's' : ''}
          {view.streak.activeToday ? '' : ' — pas encore aujourd’hui'}
        </Badge>
      ) : null}

      {view.xp ? (
        <div className="text-right">
          <p className="font-display text-lg font-semibold">{view.xp.total} XP</p>
          <p className="text-xs text-text-subtle">
            Niveau {view.xp.level} · {view.xp.xpToNextLevel} XP pour le suivant
          </p>
        </div>
      ) : null}

      <ProgressRing value={view.overallProgressPercent} label="Progression globale" size={64} />
    </div>
  );
}

/** Always present, always carrying the engine's reason (CDC §66, §81). */
function NextBestAction({ view }: { view: DashboardView }) {
  const action = view.nextBestAction;

  return (
    <Card emphasis className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-alt">
        Prochaine meilleure action
      </p>
      <h2 className="font-display text-xl font-semibold">{action.label}</h2>
      <p className="max-w-prose text-sm leading-relaxed text-text-muted">{action.reason}</p>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={action.href}
          className="inline-flex h-11 items-center rounded-control bg-accent px-5 text-sm font-semibold text-accent-on no-underline"
        >
          {action.type === 'CAUGHT_UP' ? 'Explorer' : 'Commencer'}
        </Link>
        {action.estimatedMinutes > 0 ? (
          <span className="text-[13px] text-text-subtle">{action.estimatedMinutes} min</span>
        ) : null}
      </div>
    </Card>
  );
}

function Continue({ view }: { view: DashboardView }) {
  if (!view.continue) {
    return (
      <Card quiet className="flex flex-col gap-2">
        <h2 className="font-display text-base font-semibold">Rien en cours</h2>
        <p className="text-sm text-text-muted">
          Tous tes chapitres ouverts sont terminés. La suite se débloque en montrant ta maîtrise.
        </p>
        <Link href="/learn" className="text-[13px]">
          Voir les parcours
        </Link>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-[0.08em] text-text-subtle">Reprendre</p>
      <h2 className="font-display text-base font-semibold">
        <Link
          href={`/learn/${view.continue.technologySlug}/${view.continue.chapterSlug}`}
          className="text-text no-underline"
        >
          {view.continue.title}
        </Link>
      </h2>
      <ProgressBar
        value={view.continue.progressPercent}
        label={`Lecture de ${view.continue.title}`}
        showValue
      />
    </Card>
  );
}

function Attention({ view }: { view: DashboardView }) {
  // A panel whose source failed is hidden; the primary action stays.
  if (view.degraded.includes('attention')) return null;

  if (view.attention.length === 0) {
    return (
      <Card quiet className="flex flex-col gap-2">
        <h2 className="font-display text-base font-semibold">Rien à renforcer</h2>
        <p className="text-sm text-text-muted">Aucune compétence n’est en retard de révision.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-xs uppercase tracking-[0.08em] text-text-subtle">
        {view.attention.length} compétence{view.attention.length > 1 ? 's' : ''} à surveiller
      </p>

      <ul className="flex list-none flex-col gap-3 p-0">
        {view.attention.map((skill) => (
          <li key={skill.skillId} className="flex flex-col gap-1.5">
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

      <Link href="/boost" className="text-[13px]">
        Lancer un Boost
      </Link>
    </Card>
  );
}

function TodayPlan({ view }: { view: DashboardView }) {
  if (view.todayPlan.length === 0) return null;
  const total = view.todayPlan.reduce((sum, item) => sum + item.estimatedMinutes, 0);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-semibold">Ton objectif aujourd’hui</h2>
        <p className="text-[13px] text-text-subtle">
          {total} min sur {view.user.dailyMinutesTarget} min
        </p>
      </div>

      <ol className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {view.todayPlan.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex h-full flex-col gap-2 rounded-card border border-border bg-surface-sunken p-4 no-underline"
            >
              <span className="text-[11px] uppercase tracking-[0.06em] text-accent-alt">
                {item.kind}
              </span>
              <span className="text-sm font-medium text-text">{item.label}</span>
              <span className="mt-auto font-mono text-xs text-text-subtle">
                {item.estimatedMinutes} min
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function Technologies({ view }: { view: DashboardView }) {
  if (view.technologies.length === 0) return null;

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="font-display text-base font-semibold">Tes parcours</h2>
      <ul className="flex list-none flex-col gap-3 p-0">
        {view.technologies.map((technology) => (
          <li key={technology.slug}>
            <Link href={`/learn/${technology.slug}`} className="no-underline">
              <ProgressBar value={technology.progressPercent} label={technology.name} showValue />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
