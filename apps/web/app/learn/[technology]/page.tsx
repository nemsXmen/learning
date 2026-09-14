import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, ProgressRing } from '@app/ui';
import { ApiError } from '../../../lib/api';
import {
  getTechnology,
  type ChapterView,
  type ModuleView,
  type PartView,
  type TechnologyDetail,
} from '../../../lib/catalog';

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface PageProps {
  params: Promise<{ technology: string }>;
}

export default async function TechnologyPage({ params }: PageProps) {
  const { technology: slug } = await params;

  let detail: TechnologyDetail;
  try {
    detail = await getTechnology(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <p className="mb-6 text-[13px] text-text-muted">
        <Link href="/learn">Apprendre</Link> <span aria-hidden="true">·</span> {detail.name}
      </p>

      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">{detail.name}</h1>
          <p className="mt-2 max-w-prose text-[15px] text-text-muted">{detail.description}</p>
        </div>

        <div className="flex items-center gap-6">
          <ProgressRing value={detail.progressPercent} label={`Progression en ${detail.name}`} />
          {detail.continue ? (
            <Link
              href={`/learn/${detail.slug}/${detail.continue.chapterSlug}`}
              className="inline-flex h-11 items-center rounded-control bg-accent px-5 text-sm font-semibold text-accent-on no-underline"
            >
              Reprendre
            </Link>
          ) : null}
        </div>
      </header>

      {detail.parts.length > 0 ? (
        <>
          <PartsOverview parts={detail.parts} />
          <div className="mt-10 flex flex-col gap-14">
            {detail.parts
              .filter((part) => part.moduleSlugs.length > 0)
              .map((part) => (
                <section key={part.slug} id={`partie-${part.slug}`} className="scroll-mt-8">
                  <h2 className="font-display text-2xl font-semibold">{part.title}</h2>
                  {part.description ? (
                    <p className="mt-2 max-w-prose text-[15px] text-text-muted">{part.description}</p>
                  ) : null}
                  <div className="mt-6 flex flex-col gap-8">
                    {detail.modules
                      .filter((module) => module.part === part.slug)
                      .map((module) => (
                        <ModuleSection key={module.slug} technologySlug={detail.slug} module={module} heading="h3" />
                      ))}
                  </div>
                </section>
              ))}
          </div>
        </>
      ) : (
        <>
          <Roadmap modules={detail.modules} />
          <div className="mt-10 flex flex-col gap-8">
            {detail.modules.map((module) => (
              <ModuleSection key={module.slug} technologySlug={detail.slug} module={module} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The whole programme at a glance. With dozens of modules a flat roadmap stops
 * being readable, so parts come first; a part without modules yet is upcoming.
 */
function PartsOverview({ parts }: { parts: PartView[] }) {
  return (
    <Card>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-text-subtle">Programme</h2>
      <ol className="grid list-none grid-cols-1 gap-1 p-0 sm:grid-cols-2">
        {parts.map((part, index) => {
          const ready = part.moduleSlugs.length > 0;
          const content = (
            <span className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-pill border font-mono text-xs ${
                  part.progressPercent === 100
                    ? 'border-success/60 bg-success/10 text-success'
                    : part.progressPercent > 0
                      ? 'border-accent-soft bg-accent-surface text-accent-soft'
                      : 'border-border-strong text-text-subtle'
                }`}
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm ${ready ? 'text-text' : 'text-text-muted'}`}>{part.title}</span>
                <span className="block text-xs text-text-subtle">
                  {ready
                    ? `${part.moduleSlugs.length} module${part.moduleSlugs.length > 1 ? 's' : ''} · ${part.progressPercent} %`
                    : 'En préparation'}
                </span>
              </span>
            </span>
          );
          return (
            <li key={part.slug}>
              {ready ? (
                <a href={`#partie-${part.slug}`} className="block rounded-control px-2 py-2 no-underline hover:bg-surface-raised">
                  {content}
                </a>
              ) : (
                <span className="block px-2 py-2">{content}</span>
              )}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

/**
 * A semantic ordered list first, a visual sequence second: the roadmap must read
 * correctly without the graphics (features/05-learning-catalog/UX.md).
 */
function Roadmap({ modules }: { modules: ModuleView[] }) {
  return (
    <Card>
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.08em] text-text-subtle">
        Parcours
      </h2>
      <ol className="flex list-none flex-col gap-3 p-0 sm:flex-row sm:items-center sm:gap-0">
        {modules.map((module, index) => (
          <li key={module.slug} className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2">
            <span
              aria-hidden="true"
              className={`flex size-8 shrink-0 items-center justify-center rounded-pill border text-xs ${
                module.progressPercent === 100
                  ? 'border-success/60 bg-success/10 text-success'
                  : module.progressPercent > 0
                    ? 'border-accent-soft bg-accent-surface text-accent-soft'
                    : 'border-border-strong text-text-subtle'
              }`}
            >
              {index + 1}
            </span>
            <span className="text-[13px] text-text sm:text-center">{module.title}</span>
            <span className="ml-auto font-mono text-xs text-text-subtle sm:ml-0">
              {module.progressPercent} %
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function ModuleSection({
  technologySlug,
  module,
  heading: Heading = 'h2',
}: {
  technologySlug: string;
  module: ModuleView;
  /** h3 inside a part section, so the outline stays correctly nested. */
  heading?: 'h2' | 'h3';
}) {
  const done = module.chapters.filter((chapter) => chapter.status === 'COMPLETED').length;

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <Heading className="font-display text-lg font-semibold">{module.title}</Heading>
        <p className="text-[13px] text-text-subtle">
          {done} chapitre{done > 1 ? 's' : ''} sur {module.chapters.length} terminé
          {done > 1 ? 's' : ''}
        </p>
      </div>

      <ul className="flex list-none flex-col gap-3 p-0">
        {module.chapters.map((chapter) => (
          <ChapterRow key={chapter.id} technologySlug={technologySlug} chapter={chapter} />
        ))}
      </ul>
    </section>
  );
}

function ChapterRow({
  technologySlug,
  chapter,
}: {
  technologySlug: string;
  chapter: ChapterView;
}) {
  const meta = (
    <span className="flex items-center gap-3 font-mono text-xs text-text-subtle">
      <span>{chapter.estimatedMinutes} min</span>
      <span>{chapter.xp} XP</span>
    </span>
  );

  if (chapter.locked) {
    return (
      <Card as="li" quiet className="flex flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span aria-hidden="true" className="text-text-subtle">
            &#128274;
          </span>
          <span className="flex-1 text-sm text-text-muted">{chapter.title}</span>
          {meta}
          {/* Lock state is text, not colour alone. */}
          <Badge>Verrouillé</Badge>
        </div>
        {chapter.lockReason ? (
          <p className="pl-7 text-[13px] text-text-subtle">
            Débloqué quand{' '}
            {chapter.lockReason.skills.map((skill, index) => (
              <span key={skill.id}>
                {index > 0 ? ' et ' : ''}
                <span className="text-text-muted">{skill.name}</span> atteint {skill.required} % de
                maîtrise — tu es à {skill.mastery} %
              </span>
            ))}
            .
          </p>
        ) : null}
      </Card>
    );
  }

  return (
    <Card as="li" emphasis={chapter.status === 'IN_PROGRESS'} className="p-4">
      <Link
        href={`/learn/${technologySlug}/${chapter.slug}`}
        className="flex flex-wrap items-center gap-3 no-underline"
      >
        <StatusIcon status={chapter.status} />
        <span className="flex-1 text-sm font-medium text-text">{chapter.title}</span>
        {meta}
        <span className="w-12 text-right font-mono text-xs text-text-muted">
          {chapter.status === 'NOT_STARTED' ? '—' : `${chapter.progressPercent} %`}
        </span>
      </Link>
    </Card>
  );
}

function StatusIcon({ status }: { status: ChapterView['status'] }) {
  if (status === 'COMPLETED') {
    return (
      <span className="flex items-center gap-1 text-success">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
        >
          <path d="M4 12.5l5 5L20 6.5" />
        </svg>
        <span className="sr-only">Terminé</span>
      </span>
    );
  }
  if (status === 'IN_PROGRESS') {
    return (
      <span className="flex items-center gap-1 text-accent-soft">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M5 12h13" />
          <path d="M13 6l6 6-6 6" />
        </svg>
        <span className="sr-only">En cours</span>
      </span>
    );
  }
  return (
    <span className="flex size-4 items-center justify-center">
      <span aria-hidden="true" className="size-2 rounded-pill border border-border-strong" />
      <span className="sr-only">Pas commencé</span>
    </span>
  );
}
