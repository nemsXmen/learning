// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReadingTracker } from './reading-tracker';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const TEST_ACTION = { label: 'Passer le test', href: '/learn/javascript/variables/quiz' };

function renderBar(completed: boolean, nextAction = TEST_ACTION as typeof TEST_ACTION | null) {
  return render(
    <ReadingTracker
      chapterId="javascript-variables"
      initialPercent={40}
      completed={completed}
      nextAction={nextAction}
    />,
  );
}

describe('ReadingTracker bar', () => {
  it('offers the completion while the chapter is being read', () => {
    renderBar(false);
    expect(screen.getByRole('button', { name: /marquer comme terminé/i })).toBeInTheDocument();
  });

  it('stops offering a completion that already happened', () => {
    // The reported bug: the button stayed after the chapter was finished.
    renderBar(true);
    expect(screen.queryByRole('button', { name: /marquer comme terminé/i })).toBeNull();
    expect(screen.getByText(/chapitre terminé/i)).toBeInTheDocument();
  });

  it('turns into the next step once finished', () => {
    renderBar(true);
    expect(screen.getByRole('link', { name: 'Passer le test' })).toHaveAttribute(
      'href',
      '/learn/javascript/variables/quiz',
    );
  });

  it('gets out of the way when finished with nothing left to do', () => {
    const { container } = renderBar(true, null);
    expect(container).toBeEmptyDOMElement();
  });
});
