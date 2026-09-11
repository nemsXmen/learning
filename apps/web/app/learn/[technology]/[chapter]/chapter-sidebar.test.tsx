// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChapterSidebar } from './chapter-sidebar';
import type { ChapterView, ModuleView } from '../../../../lib/catalog';

function chapter(partial: Partial<ChapterView> & { slug: string; title: string }): ChapterView {
  return {
    id: partial.slug,
    order: 1,
    estimatedMinutes: 10,
    difficulty: 2,
    xp: 50,
    status: 'NOT_STARTED',
    progressPercent: 0,
    locked: false,
    lockReason: null,
    ...partial,
  };
}

const MODULE: ModuleView = {
  slug: 'bases',
  title: 'Les bases',
  order: 1,
  progressPercent: 20,
  chapters: [
    chapter({ slug: 'variables', title: 'Les variables', status: 'IN_PROGRESS' }),
    chapter({ slug: 'fonctions', title: 'Les fonctions', locked: true }),
  ],
};

function renderSidebar(quizHref: string | null) {
  return render(
    <ChapterSidebar
      technologySlug="javascript"
      technologyName="JavaScript"
      module={MODULE}
      currentSlug="variables"
      quizHref={quizHref}
    />,
  );
}

describe('ChapterSidebar', () => {
  it('offers the chapter test from the module outline', () => {
    // The regression this guards: the test route existed with nothing linking to it.
    renderSidebar('/learn/javascript/variables/quiz');

    const links = screen.getAllByRole('link', { name: /test/i });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/learn/javascript/variables/quiz');
    }
  });

  it('shows no test entry when the chapter has none', () => {
    renderSidebar(null);
    expect(screen.queryByRole('link', { name: /test/i })).toBeNull();
  });

  it('attaches the test to the chapter being read, not to every chapter', () => {
    renderSidebar('/learn/javascript/variables/quiz');

    const current = screen.getByRole('link', { name: /Les variables/ });
    const entry = screen.getAllByRole('link', { name: /Test du chapitre/ })[0]!;
    // Same list item: the test reads as the step after this chapter.
    expect(current.closest('li')).toBe(entry.closest('li'));
  });

  it('marks a locked chapter as unreachable rather than linking it', () => {
    renderSidebar(null);
    expect(screen.queryByRole('link', { name: /Les fonctions/ })).toBeNull();
    expect(screen.getByText(/Les fonctions/).closest('[aria-disabled="true"]')).not.toBeNull();
  });
});
