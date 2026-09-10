import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, ProgressBar } from '@app/ui';
import { ApiError } from '../../../../lib/api';
import {
  getChapter,
  getChapterProgress,
  getTechnology,
  type ChapterPayload,
  type ChapterProgress,
  type TechnologyDetail,
} from '../../../../lib/catalog';
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

  let progress: ChapterProgress | null = null;
  try {
    progress = await getChapterProgress(chapter.id);
  } catch {
    // Progress is an enhancement here: the chapter must still be readable.
  }

  const module = detail.modules.find((item) => item.slug === chapter.module.slug);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-0 lg:gap-10">
      <ChapterSidebar
        technologySlug={technologySlug}
        technologyName={chapter.technology.name}
        module={module ?? null}
        currentSlug={chapter.slug}
      />

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:py-12">
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

            <h1 className="font-display text-4xl font-semibold leading-tight">{chapter.title}</h1>

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
            detail={detail}
            completed={progress?.status === 'COMPLETED'}
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

      <ReadingTracker chapterId={chapter.id} initialPercent={progress?.progressPercent ?? 0} />
    </div>
  );
}

function ChapterFooter({
  technologySlug,
  chapter,
  detail,
  completed,
}: {
  technologySlug: string;
  chapter: ChapterPayload;
  detail: TechnologyDetail;
  completed: boolean;
}) {
  const chapters = detail.modules.flatMap((module) => module.chapters);
  const slugOf = (id: string | null) => chapters.find((item) => item.id === id)?.slug ?? null;
  const previous = slugOf(chapter.neighbours.previous);
  const next = slugOf(chapter.neighbours.next);
  const nextChapter = chapters.find((item) => item.slug === next);

  return (
    <footer className="mt-4 flex flex-col gap-5 border-t border-border pt-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {previous ? (
          <Link href={`/learn/${technologySlug}/${previous}`} className="text-[13px] text-text-muted">
            ← Chapitre précédent
          </Link>
        ) : (
          <span />
        )}

        {next && !nextChapter?.locked ? (
          <Link href={`/learn/${technologySlug}/${next}`} className="text-[13px]">
            Chapitre suivant →
          </Link>
        ) : null}
      </div>

      {completed ? (
        <Card emphasis className="flex flex-col gap-2">
          <h2 className="font-display text-base font-semibold">Chapitre terminé</h2>
          <p className="text-sm text-text-muted">
            {nextChapter?.locked
              ? 'La suite se débloquera quand tu auras montré ta maîtrise sur les compétences de ce chapitre.'
              : 'Tu peux enchaîner sur le chapitre suivant.'}
          </p>
        </Card>
      ) : null}
    </footer>
  );
}
