'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@app/ui';

const DURATIONS = [5, 10, 15] as const;

/**
 * Picks a duration and starts a session. The plan is built by the API — never in
 * the browser (features/12-boost-session/REQUIREMENTS.md).
 */
export function StartBoost({ suggestedMinutes }: { suggestedMinutes: number }) {
  const router = useRouter();
  const closest = DURATIONS.reduce((best, value) =>
    Math.abs(value - suggestedMinutes) < Math.abs(best - suggestedMinutes) ? value : best,
  );

  const [minutes, setMinutes] = useState<number>(closest);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(): Promise<void> {
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/boost/sessions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ availableMinutes: minutes }),
      });
      if (!response.ok) throw new Error(String(response.status));

      const session = (await response.json()) as { sessionId: string };
      router.push(`/boost/session/${session.sessionId}`);
    } catch {
      setError('Impossible de démarrer la session. Réessaie dans un instant.');
      setPending(false);
    }
  }

  return (
    <Card className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-xs uppercase tracking-[0.08em] text-text-subtle">
          Combien de temps as-tu ?
        </legend>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((value) => (
            <label
              key={value}
              className={`cursor-pointer rounded-pill border px-4 py-2.5 text-sm ${
                minutes === value
                  ? 'border-accent-border bg-accent-surface text-accent-soft'
                  : 'border-border text-text-muted'
              }`}
            >
              <input
                type="radio"
                name="minutes"
                value={value}
                checked={minutes === value}
                onChange={() => setMinutes(value)}
                className="sr-only"
              />
              {value} min
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      ) : null}

      <Button size="lg" loading={pending} onClick={start}>
        Commencer le Boost
      </Button>
    </Card>
  );
}
