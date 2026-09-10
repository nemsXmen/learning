'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Drawer } from '@app/ui';
import type { ModuleView } from '../../../../lib/catalog';

interface Props {
  technologySlug: string;
  technologyName: string;
  module: ModuleView | null;
  currentSlug: string;
}

/** Sticky beside the text on desktop, a drawer on mobile — same list either way. */
export function ChapterSidebar({ technologySlug, technologyName, module, currentSlug }: Props) {
  const [open, setOpen] = useState(false);
  if (!module) return null;

  const list = <ChapterList technologySlug={technologySlug} module={module} currentSlug={currentSlug} />;

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-bg/90 px-5 py-3 backdrop-blur lg:hidden">
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          Sommaire du module
        </Button>
        <span className="truncate text-[13px] text-text-muted">{module.title}</span>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title={module.title}>
        {list}
      </Drawer>

      <nav
        aria-label={`Chapitres du module ${module.title}`}
        className="hidden w-72 shrink-0 border-r border-border px-4 py-12 lg:block"
      >
        <div className="sticky top-12 flex flex-col gap-5">
          <Link href={`/learn/${technologySlug}`} className="text-[13px] text-text-muted no-underline">
            ← {technologyName}
          </Link>
          <div>
            <p className="text-[11px] uppercase tracking-[0.08em] text-text-subtle">Module</p>
            <h2 className="mt-1 font-display text-[15px] font-semibold">{module.title}</h2>
          </div>
          {list}
        </div>
      </nav>
    </>
  );
}

function ChapterList({ technologySlug, module, currentSlug }: Omit<Props, 'technologyName'>) {
  if (!module) return null;

  return (
    <ol className="flex list-none flex-col gap-1 p-0">
      {module.chapters.map((chapter) => {
        const current = chapter.slug === currentSlug;
        const label = chapter.locked
          ? 'Verrouillé'
          : chapter.status === 'COMPLETED'
            ? 'Terminé'
            : chapter.status === 'IN_PROGRESS'
              ? 'En cours'
              : 'Pas commencé';

        const content = (
          <span className="flex items-center gap-2.5">
            {/* Status is text for assistive tech, a glyph for everyone else. */}
            <span aria-hidden="true" className="w-4 text-center text-xs">
              {chapter.locked ? '\u{1F512}' : chapter.status === 'COMPLETED' ? '✓' : current ? '→' : '○'}
            </span>
            <span className="flex-1">{chapter.title}</span>
            <span className="sr-only">({label})</span>
          </span>
        );

        const className = `block rounded-control px-3 py-2 text-[13.5px] no-underline ${
          current
            ? 'bg-surface text-text shadow-[inset_2px_0_0_var(--color-accent-soft)]'
            : chapter.locked
              ? 'text-text-subtle'
              : 'text-text-muted hover:bg-surface hover:text-text'
        }`;

        return (
          <li key={chapter.id}>
            {chapter.locked ? (
              <span className={className} aria-disabled="true">
                {content}
              </span>
            ) : (
              <Link
                href={`/learn/${technologySlug}/${chapter.slug}`}
                className={className}
                aria-current={current ? 'page' : undefined}
              >
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
