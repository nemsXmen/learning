'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@app/ui';

const REPORT_INTERVAL_MS = 15_000;

/** Scroll depth as a percentage, 100 when the page is too short to scroll. */
export function scrollDepthPercent(
  scrollY: number,
  viewportHeight: number,
  documentHeight: number,
): number {
  const scrollable = documentHeight - viewportHeight;
  if (scrollable <= 0) return 100;

  // iOS rubber-banding reports a negative offset above the top; that is still
  // the top, not less than it.
  const offset = Math.max(0, scrollY);
  return Math.min(100, Math.round(((offset + viewportHeight) / documentHeight) * 100));
}

interface Props {
  chapterId: string;
  initialPercent: number;
  /** Already finished: the bar must stop offering an action that is done. */
  completed: boolean;
  /** The step decided by the page, so the bar and the closing card agree. */
  nextAction: { label: string; href: string } | null;
}

/**
 * Reports reading progress and offers the explicit completion.
 *
 * Everything goes to a Next.js route handler, never to the API directly: the
 * access token stays in the server runtime (docs/rules.md #21). Reports are
 * throttled and the last value is flushed when the page is hidden, so closing a
 * tab does not lose the reading.
 */
export function ReadingTracker({ chapterId, initialPercent, completed, nextAction }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reported = useRef(initialPercent);
  const current = useRef(initialPercent);
  const lastSentAt = useRef(Date.now());

  const send = useCallback(
    async (percent: number, seconds: number) => {
      if (percent <= reported.current) return;
      reported.current = percent;

      try {
        await fetch(`/api/learn/chapters/${encodeURIComponent(chapterId)}/progress`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ progressPercent: percent, timeSpentSeconds: seconds }),
          keepalive: true,
        });
      } catch {
        // Silent by design: a failed progress report must not interrupt reading.
      }
    },
    [chapterId],
  );

  useEffect(() => {
    function measure(): void {
      current.current = Math.max(
        current.current,
        scrollDepthPercent(window.scrollY, window.innerHeight, document.body.scrollHeight),
      );
    }

    function flush(): void {
      const seconds = Math.round((Date.now() - lastSentAt.current) / 1000);
      lastSentAt.current = Date.now();
      void send(current.current, seconds);
    }

    measure();
    window.addEventListener('scroll', measure, { passive: true });
    const timer = window.setInterval(flush, REPORT_INTERVAL_MS);

    // A closed tab still reports what was read.
    const onHidden = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHidden);

    return () => {
      window.removeEventListener('scroll', measure);
      document.removeEventListener('visibilitychange', onHidden);
      window.clearInterval(timer);
      flush();
    };
  }, [send]);

  async function complete(): Promise<void> {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/learn/chapters/${encodeURIComponent(chapterId)}/complete`,
        { method: 'POST' },
      );
      if (!response.ok) throw new Error('refus');
      router.refresh();
    } catch {
      setError('Impossible d’enregistrer. Réessaie dans un instant.');
    } finally {
      setPending(false);
    }
  }

  // Finished and nothing left to propose: the bar has no reason to cover the page.
  if (completed && !nextAction) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/95 px-5 py-3 backdrop-blur lg:left-72">
      <div className="mx-auto flex max-w-[46rem] items-center justify-between gap-4">
        {completed ? (
          <p className="flex min-w-0 items-center gap-2 text-[13px] text-text-muted">
            <span aria-hidden="true" className="text-success">
              ✓
            </span>
            <span className="truncate">Chapitre terminé</span>
          </p>
        ) : (
          <p aria-live="polite" className="text-[13px] text-danger">
            {error}
          </p>
        )}

        {completed ? (
          <Link
            href={nextAction!.href}
            className="inline-flex h-9 shrink-0 items-center rounded-control bg-accent px-4 text-[13px] font-semibold text-accent-on no-underline"
          >
            {nextAction!.label}
          </Link>
        ) : (
          <Button onClick={complete} loading={pending} size="sm">
            Marquer comme terminé
          </Button>
        )}
      </div>
    </div>
  );
}
