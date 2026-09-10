'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card } from '@app/ui';

type Given = number[] | boolean | string | null;

interface Step {
  index: number;
  kind: string;
  skillId: string;
  skillName: string;
  estimatedMinutes: number;
  question: {
    id: string;
    type: string;
    difficulty: number;
    question: string;
    options?: string[];
  } | null;
}

export interface BoostSessionView {
  sessionId: string;
  status: string;
  targetSkillIds: string[];
  estimatedMinutes: number;
  reason: string;
  currentStepIndex: number;
  steps: Step[];
}

interface StepResult {
  index: number;
  isCorrect: boolean;
  correct?: Given;
  explanation?: string;
  nextStepIndex: number | null;
}

interface Completion {
  scorePercent: number;
  masteryDeltas: Array<{ skillId: string; name: string; delta: number }>;
  xpAwarded: number;
}

const KIND_LABELS: Record<string, string> = {
  QUESTION: 'Question',
  EXPLANATION: 'Explication',
  EXERCISE: 'Exercice',
  MINI_TEST: 'Mini-test',
};

/** One step per screen. The session resumes where it was left (CDC §17). */
export function BoostRunner({ session }: { session: BoostSessionView }) {
  const router = useRouter();
  const [index, setIndex] = useState(Math.min(session.currentStepIndex, session.steps.length - 1));
  const [answer, setAnswer] = useState<Given>(null);
  const [result, setResult] = useState<StepResult | null>(null);
  const [done, setDone] = useState<Completion | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = session.steps[index];
  const finished = session.status === 'COMPLETED';

  async function submitStep(): Promise<void> {
    setPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/boost/sessions/${session.sessionId}/steps/${index}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ given: answer }),
        },
      );
      if (!response.ok) throw new Error(String(response.status));
      setResult((await response.json()) as StepResult);
    } catch {
      setError('Impossible d’enregistrer cette réponse. Réessaie.');
    } finally {
      setPending(false);
    }
  }

  async function next(): Promise<void> {
    if (result?.nextStepIndex !== null && result?.nextStepIndex !== undefined) {
      setIndex(result.nextStepIndex);
      setAnswer(null);
      setResult(null);
      return;
    }

    setPending(true);
    try {
      const response = await fetch(`/api/boost/sessions/${session.sessionId}/complete`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(String(response.status));
      setDone((await response.json()) as Completion);
      router.refresh();
    } catch {
      setError('Impossible de terminer la session.');
    } finally {
      setPending(false);
    }
  }

  if (done || finished) {
    return <BoostResult completion={done} />;
  }

  if (!step) {
    return (
      <Shell>
        <Card quiet>
          <p className="text-sm text-text-muted">Cette session ne contient aucune étape.</p>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-[13px] text-text-muted">
          Étape {index + 1} sur {session.steps.length}
        </p>
        <div className="h-1.5 w-40 overflow-hidden rounded-pill bg-border">
          <div
            className="h-full rounded-pill bg-accent-soft transition-[width] duration-[var(--duration-base)]"
            style={{ width: `${((index + 1) / session.steps.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">{KIND_LABELS[step.kind] ?? step.kind}</Badge>
          <Badge>{step.skillName}</Badge>
        </div>

        {step.question ? (
          <>
            <h1 className="font-display text-xl font-semibold leading-snug">
              {step.question.question.trim()}
            </h1>

            {step.question.options ? (
              <fieldset className="flex flex-col gap-2" disabled={result !== null}>
                <legend className="sr-only">Choisis une réponse</legend>
                {step.question.options.map((option, position) => {
                  const selected = Array.isArray(answer) && answer.includes(position);
                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-3 rounded-control border px-4 py-3 text-sm ${
                        selected ? 'border-accent-border bg-accent-surface' : 'border-border bg-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name={step.question!.id}
                        checked={selected}
                        onChange={() => setAnswer([position])}
                        className="size-4 accent-[var(--color-accent)]"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </fieldset>
            ) : (
              <label className="flex flex-col gap-2">
                <span className="text-[13px] text-text-muted">Ta réponse</span>
                <input
                  type="text"
                  disabled={result !== null}
                  value={typeof answer === 'string' ? answer : ''}
                  onChange={(event) => setAnswer(event.target.value)}
                  className="h-11 rounded-control border border-border bg-surface-sunken px-3.5 font-mono text-sm focus-visible:border-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
                />
              </label>
            )}
          </>
        ) : (
          <p className="text-sm leading-relaxed text-text-muted">
            Prends un instant pour revoir {step.skillName} avant de continuer.
          </p>
        )}

        {result ? (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="text-[13px]">
              {/* Text and icon, never colour alone. */}
              <span className={result.isCorrect ? 'text-success' : 'text-danger'}>
                {result.isCorrect ? '✓ Correct' : '✕ Incorrect'}
              </span>
            </p>
            {result.explanation ? (
              <p className="text-sm leading-relaxed text-text-muted">
                {result.explanation.trim()}
              </p>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="text-[13px] text-danger">
            {error}
          </p>
        ) : null}

        {result ? (
          <Button onClick={next} loading={pending} size="lg">
            {result.nextStepIndex === null ? 'Terminer la session' : 'Étape suivante'}
          </Button>
        ) : (
          <Button
            onClick={submitStep}
            loading={pending}
            size="lg"
            disabled={step.question !== null && answer === null}
            disabledReason="Choisis une réponse avant de valider"
          >
            {step.question ? 'Valider' : 'Continuer'}
          </Button>
        )}
      </Card>
    </Shell>
  );
}

/** CDC §80: what the session actually moved, skill by skill. */
function BoostResult({ completion }: { completion: Completion | null }) {
  return (
    <Shell>
      <Card emphasis className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-semibold">Session terminée</h1>
          {completion ? (
            <span
              className="font-display text-3xl font-bold text-success"
              aria-label={`Score ${completion.scorePercent} %`}
            >
              {completion.scorePercent} %
            </span>
          ) : null}
        </div>

        {completion && completion.masteryDeltas.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.08em] text-text-subtle">
              Ce que ça a déplacé
            </p>
            <ul className="flex list-none flex-col gap-2 p-0">
              {completion.masteryDeltas.map((delta) => (
                <li key={delta.skillId} className="flex items-center justify-between gap-4 text-sm">
                  <span>{delta.name}</span>
                  <span
                    className={`font-mono text-[13px] ${delta.delta > 0 ? 'text-success' : 'text-text-subtle'}`}
                  >
                    {delta.delta > 0 ? '+' : ''}
                    {delta.delta} %
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {completion && completion.xpAwarded > 0 ? (
          <p className="text-sm text-accent-soft">+{completion.xpAwarded} XP</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-control bg-accent px-5 text-sm font-semibold text-accent-on no-underline"
          >
            Retour au tableau de bord
          </Link>
          <Link
            href="/boost"
            className="inline-flex h-11 items-center rounded-control border border-border px-5 text-sm font-medium text-text no-underline"
          >
            Refaire un Boost
          </Link>
        </div>
      </Card>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-10 sm:px-8">{children}</main>
  );
}
