import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, ProgressBar } from '@app/ui';
import { ApiError } from '../../../../lib/api';
import {
  getChapter,
  getChapterProgress,
  getQuizHistory,
  getTechnology,
  type AttemptSummary,
  type ChapterPayload,
  type ChapterView,
  type ChapterProgress,
  type TechnologyDetail,
} from '../../../../lib/catalog';
import { decideNextStep, type NextStep } from './next-step';
import { ChapterSidebar } from './chapter-sidebar';
import { ReadingTracker } from './reading-tracker';
import { LockedChapter } from './locked-chapter';

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface PageProps {
  params: Promise<{ technology: string; chapter: string }>;
}

export default async function ChapterPage({ params }: PageProps) {
  const { technology: technologySlug, chapter: chapterSlug } = await params;

  let chapter: ChapterPayload;
  let detail: TechnologyDetail;
  try {
    // Both server-side and in parallel: the sidebar and the body are one screen.
    [chapter, detail] = await Promise.all([
      getChapter(technologySlug, chapterSlug),
      getTechnology(technologySlug),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      // A locked chapter is a state to explain, not a crash — and no content
      // reaches the page, because the API refused to send it.
      return <LockedChapter technologySlug={technologySlug} error={error} />;
    }
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  // Both are enhancements: a chapter must stay readable when either fails.
  const [progress, attempts] = await Promise.all([
    getChapterProgress(chapter.id).catch((): ChapterProgress | null => null),
    chapter.quiz
      ? getQuizHistory(chapter.quiz.id).catch((): AttemptSummary[] => [])
      : Promise.resolve<AttemptSummary[]>([]),
  ]);

  const module = detail.modules.find((item) => item.slug === chapter.module.slug);
  const completed = progress?.status === 'COMPLETED';

  // Decided once and shared: the closing card and the fixed bar must never offer
  // two different next steps.
  const chapters = detail.modules.flatMap((item) => item.chapters);
  const nextChapter = chapters.find((item) => item.id === chapter.neighbours.next) ?? null;
  const step = decideNextStep({
    technologySlug,
    chapter,
    progress,
    attempts,
    nextChapter: nextChapter
      ? { slug: nextChapter.slug, title: nextChapter.title, locked: nextChapter.locked }
      : null,
  });

  // The bar is fixed over the page; without this the article ends underneath it.
  const barVisible = !completed;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col lg:flex-row lg:gap-10">
      <ChapterSidebar
        technologySlug={technologySlug}
        technologyName={chapter.technology.name}
        module={module ?? null}
        currentSlug={chapter.slug}
        quizHref={chapter.quiz ? `/learn/${technologySlug}/${chapter.slug}/quiz` : null}
      />

      {/*
        No `py` shorthand here: a `lg:py-*` rule lives in a media query and so
        wins over a plain `pb-*` further up the stylesheet, which silently ate
        the space reserved for the bar and let it cover the end of the article.
        The bottom padding is stated once, and is the only rule that sets it.
      */}
      <main
        className={`min-w-0 flex-1 px-5 pt-8 sm:px-8 lg:pt-12 ${
          barVisible ? 'pb-32' : 'pb-8 lg:pb-12'
        }`}
      >
        <article className="mx-auto flex max-w-[46rem] flex-col gap-7">
          <header className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-subtle">
              <Badge tone="accent">{chapter.technology.name}</Badge>
              <span>{chapter.level}</span>
              <span aria-hidden="true">·</span>
              <span>{chapter.estimatedMinutes} min</span>
              <span aria-hidden="true">·</span>
              <span>{chapter.xp} XP</span>
            </div>

            <h1 className="font-display text-[1.75rem] font-semibold leading-tight sm:text-4xl">
              {chapter.title}
            </h1>

            {progress ? (
              <ProgressBar
                value={progress.progressPercent}
                label={`Lecture de ${chapter.title}`}
                showValue
                className="max-w-xs"
              />
            ) : null}

            <ul className="flex list-none flex-wrap gap-2 p-0">
              {chapter.skills.map((skill) => (
                <li key={skill.id}>
                  <Badge>{skill.name}</Badge>
                </li>
              ))}
            </ul>
          </header>

          {/*
            Rendered and sanitised by the API. Nothing is parsed in the browser,
            and the highlighting classes are themed by the token stylesheet.
          */}
          <div className="chapter-prose" dangerouslySetInnerHTML={{ __html: chapter.html }} />

          <ChapterFooter
            technologySlug={technologySlug}
            chapter={chapter}
            chapters={chapters}
            step={step}
          />
        </article>
      </main>

      <aside className="hidden w-56 shrink-0 py-12 pr-6 xl:block">
        <nav aria-label="Sur cette page" className="sticky top-12">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-subtle">
            Sur cette page
          </h2>
          <ol className="flex list-none flex-col gap-2 p-0 text-[13px]">
            {chapter.outline
              .filter((entry) => entry.depth === 2)
              .map((entry) => (
                <li key={entry.id}>
                  <a href={`#${entry.id}`} className="text-text-muted no-underline hover:text-text">
                    {entry.text}
                  </a>
                </li>
              ))}
          </ol>
        </nav>
      </aside>

      <ReadingTracker
        chapterId={chapter.id}
        initialPercent={progress?.progressPercent ?? 0}
        completed={completed}
      />
    </div>
  );
}

function ChapterFooter({
  technologySlug,
  chapter,
  chapters,
  step,
}: {
  technologySlug: string;
  chapter: ChapterPayload;
  chapters: ChapterView[];
  step: NextStep;
}) {
  const slugOf = (id: string | null) => chapters.find((item) => item.id === id)?.slug ?? null;
  const previousSlug = slugOf(chapter.neighbours.previous);
  const nextSlug = slugOf(chapter.neighbours.next);
  const next = chapters.find((item) => item.slug === nextSlug);

  return (
    <footer className="mt-4 flex flex-col gap-6 border-t border-border pt-7">
      <NextStepCard step={step} />

      {/* Sequential navigation stays, below the step that actually matters. */}
      <nav
        aria-label="Navigation entre chapitres"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        {previousSlug ? (
          <Link
            href={`/learn/${technologySlug}/${previousSlug}`}
            className="text-[13px] text-text-muted"
          >
            ← Chapitre précédent
          </Link>
        ) : (
          <span />
        )}

        {nextSlug && !next?.locked ? (
          <Link href={`/learn/${technologySlug}/${nextSlug}`} className="text-[13px]">
            Chapitre suivant →
          </Link>
        ) : null}
      </nav>
    </footer>
  );
}

/**
 * The answer to "what should I do next" (rules.md #11). On a phone the action is
 * full width and comes first in the tap order; on a wider screen it sits beside
 * the explanation.
 */
function NextStepCard({ step }: { step: NextStep }) {
  const primary = step.tone === 'primary';

  return (
    <Card emphasis={primary} className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-base font-semibold">{step.title}</h2>
          {step.tone === 'done' ? <Badge tone="accent">Réussi</Badge> : null}
        </div>
        <p className="text-sm text-text-muted">{step.body}</p>

        {step.bestScore !== null ? (
          <p className="text-[13px] text-text-subtle">
            Meilleur score : {step.bestScore} %{' '}
            <span aria-hidden="true">·</span>{' '}
            {step.attemptCount} tentative{step.attemptCount > 1 ? 's' : ''}
          </p>
        ) : null}
      </div>

      {step.action ? (
        <Link
          href={step.action.href}
          className={`inline-flex h-11 shrink-0 items-center justify-center rounded-control px-5 text-sm font-semibold no-underline ${
            primary || step.tone === 'done'
              ? 'bg-accent text-accent-on'
              : 'border border-border text-text'
          }`}
        >
          {step.action.label}
        </Link>
      ) : null}
    </Card>
  );
}
