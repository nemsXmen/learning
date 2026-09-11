// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReadingTracker } from './reading-tracker';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

function renderBar(completed: boolean) {
  return render(
    <ReadingTracker chapterId="javascript-variables" initialPercent={40} completed={completed} />,
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
  });

  it('leaves the page alone once the chapter is finished', () => {
    // It used to repeat the closing card's call to action in a bar pinned over
    // that very card — two identical buttons a hundred pixels apart.
    const { container } = renderBar(true);
    expect(container).toBeEmptyDOMElement();
  });

  it('keeps reporting the reading even after completion', () => {
    // Rendering nothing must not mean doing nothing: the early return sits below
    // the effect on purpose, so a reread still reaches the progress endpoint.
    const fetchMock = vi.fn().mockResolvedValue(new Response(null));
    vi.stubGlobal('fetch', fetchMock);

    const { unmount } = renderBar(true);
    unmount(); // Unmounting flushes what was read.

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]![0])).toContain(
      '/api/learn/chapters/javascript-variables/progress',
    );
    vi.unstubAllGlobals();
  });
});
