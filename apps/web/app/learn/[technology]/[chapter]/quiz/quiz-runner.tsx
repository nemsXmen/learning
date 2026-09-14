'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, ErrorState, Spinner } from '@app/ui';

type Given = number[] | boolean | string | null;

interface Prompt {
  id: string;
  type: string;
  difficulty: number;
  question: string;
  options?: string[];
  skills: string[];
}

interface Attempt {
  attemptId: string;
  questions: Prompt[];
}

interface Result {
  questionId: string;
  graded: boolean;
  isCorrect: boolean;
  given: Given;
  correct?: Given;
  explanation?: string;
  reviewSkills: string[];
}

interface Graded {
  scorePercent: number;
  passed: boolean;
  results: Result[];
  excludedTypes: string[];
}

/** Answers are gathered here and graded by the API — never in the browser. */
export function QuizRunner({ technology, chapter }: { technology: string; chapter: string }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Given>>({});
  const [graded, setGraded] = useState<Graded | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;

    void fetch(`/api/learn/${technology}/${chapter}/quiz/attempts`, { method: 'POST' })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return (await response.json()) as Attempt;
      })
      .then((value) => {
        if (!cancelled) setAttempt(value);
      })
      .catch(() => {
        if (!cancelled) setFailure('Impossible de démarrer le quiz.');
      });

    return () => {
      cancelled = true;
    };
  }, [technology, chapter]);

  const question = attempt?.questions[index];
  const answered = useMemo(
    () => attempt?.questions.filter((item) => answers[item.id] !== undefined).length ?? 0,
    [attempt, answers],
  );

  async function submit(): Promise<void> {
    if (!attempt) return;
    setSubmitting(true);

    try {
      const response = await fetch(`/api/quiz/attempts/${attempt.attemptId}/submit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answers: attempt.questions.map((item) => ({
            questionId: item.id,
            given: answers[item.id] ?? null,
            timeSpentMs: Math.min(3_600_000, Date.now() - startedAt.current),
          })),
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setGraded((await response.json()) as Graded);
    } catch {
      // The answers stay in state: a network failure must not lose them.
      setFailure('L’envoi a échoué. Tes réponses sont conservées, réessaie.');
    } finally {
      setSubmitting(false);
    }
  }

  if (failure && !attempt) {
    return (
      <Shell technology={technology} chapter={chapter}>
        <ErrorState title="Quiz indisponible" description={failure} />
      </Shell>
    );
  }

  if (!attempt) {
    return (
      <Shell technology={technology} chapter={chapter}>
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <Spinner label="Préparation du quiz" /> Préparation du quiz.
        </p>
      </Shell>
    );
  }

  if (graded) {
    return (
      <Shell technology={technology} chapter={chapter}>
        <QuizResult graded={graded} attempt={attempt} technology={technology} chapter={chapter} />
      </Shell>
    );
  }

  return (
    <Shell technology={technology} chapter={chapter}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] text-text-muted" aria-live="polite">
            Question {index + 1} sur {attempt.questions.length}
          </p>
          <div className="h-1.5 w-40 overflow-hidden rounded-pill bg-border">
            <div
              className="h-full rounded-pill bg-accent-soft transition-[width] duration-[var(--duration-base)]"
              style={{ width: `${((index + 1) / attempt.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {question ? (
          <QuestionCard
            question={question}
            value={answers[question.id]}
            onChange={(given) => setAnswers((current) => ({ ...current, [question.id]: given }))}
          />
        ) : null}

        {failure ? (
          <p role="alert" className="text-[13px] text-danger">
            {failure}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            disabled={index === 0}
            disabledReason="Première question"
          >
            Précédent
          </Button>

          {index < attempt.questions.length - 1 ? (
            <Button onClick={() => setIndex((value) => value + 1)}>Suivant</Button>
          ) : (
            <Button
              onClick={submit}
              loading={submitting}
              disabled={answered < attempt.questions.length}
              disabledReason="Réponds à toutes les questions avant de corriger"
            >
              Corriger {answered < attempt.questions.length ? `(${answered}/${attempt.questions.length})` : ''}
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({
  technology,
  chapter,
  children,
}: {
  technology: string;
  chapter: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
      <p className="mb-6 text-[13px] text-text-muted">
        <Link href={`/learn/${technology}/${chapter}`}>← Revenir au chapitre</Link>
      </p>
      {children}
    </div>
  );
}

function QuestionCard({
  question,
  value,
  onChange,
}: {
  question: Prompt;
  value: Given | undefined;
  onChange: (given: Given) => void;
}) {
  const multiple = question.type === 'multiple_answer';

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <Badge>Difficulté {question.difficulty}</Badge>
        {question.skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>

      <h1 className="font-display text-xl font-semibold leading-snug">{question.question.trim()}</h1>

      {question.options ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">
            {multiple ? 'Plusieurs réponses possibles' : 'Une seule réponse'}
          </legend>
          {question.options.map((option, position) => {
            const selected = Array.isArray(value) ? value.includes(position) : false;
            return (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-control border px-4 py-3 text-sm ${
                  selected ? 'border-accent-border bg-accent-surface' : 'border-border bg-surface'
                }`}
              >
                <input
                  type={multiple ? 'checkbox' : 'radio'}
                  name={question.id}
                  checked={selected}
                  onChange={() => {
                    const current = Array.isArray(value) ? value : [];
                    onChange(
                      multiple
                        ? current.includes(position)
                          ? current.filter((item) => item !== position)
                          : [...current, position]
                        : [position],
                    );
                  }}
                  className="size-4 accent-[var(--color-accent)]"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </fieldset>
      ) : question.type === 'true_false' ? (
        <fieldset className="flex gap-2">
          <legend className="sr-only">Vrai ou faux</legend>
          {[true, false].map((choice) => (
            <label
              key={String(choice)}
              className={`flex cursor-pointer items-center gap-2 rounded-control border px-4 py-3 text-sm ${
                value === choice ? 'border-accent-border bg-accent-surface' : 'border-border bg-surface'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                checked={value === choice}
                onChange={() => onChange(choice)}
                className="size-4 accent-[var(--color-accent)]"
              />
              {choice ? 'Vrai' : 'Faux'}
            </label>
          ))}
        </fieldset>
      ) : (
        <label className="flex flex-col gap-2">
          <span className="text-[13px] text-text-muted">Ta réponse</span>
          <input
            type="text"
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => onChange(event.target.value)}
            className="h-11 rounded-control border border-border bg-surface-sunken px-3.5 font-mono text-sm focus-visible:border-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
          />
        </label>
      )}
    </Card>
  );
}

/**
 * Never a bare "Incorrect": your answer, the right one, why, and what to review
 * (CDC §76).
 */
function QuizResult({
  graded,
  attempt,
  technology,
  chapter,
}: {
  graded: Graded;
  attempt: Attempt;
  technology: string;
  chapter: string;
}) {
  const byId = new Map(attempt.questions.map((question) => [question.id, question]));

  const label = (question: Prompt | undefined, given: Given): string => {
    if (given === null || given === undefined) return 'Aucune réponse';
    if (typeof given === 'boolean') return given ? 'Vrai' : 'Faux';
    if (typeof given === 'string') return given;
    return given.map((index) => question?.options?.[index] ?? `Option ${index + 1}`).join(', ');
  };

  return (
    <div className="flex flex-col gap-6">
      <Card emphasis={graded.passed} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {graded.passed ? 'Quiz réussi' : 'Pas encore'}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {graded.results.filter((result) => result.isCorrect).length} bonne(s) réponse(s) sur{' '}
            {graded.results.filter((result) => result.graded).length}
          </p>
        </div>
        <span className="font-display text-3xl font-bold" aria-label={`Score ${graded.scorePercent} %`}>
          {graded.scorePercent} %
        </span>
      </Card>

      {graded.excludedTypes.length > 0 ? (
        <p className="text-[13px] text-text-subtle">
          Les questions ouvertes ne sont pas encore corrigées automatiquement et ne comptent pas
          dans le score.
        </p>
      ) : null}

      <ol className="flex list-none flex-col gap-4 p-0">
        {graded.results.map((result) => {
          const question = byId.get(result.questionId);
          return (
            <li key={result.questionId}>
              <Card
                className="flex flex-col gap-3"
                style={{
                  borderColor: result.graded
                    ? result.isCorrect
                      ? 'var(--color-success-border)'
                      : 'var(--color-danger-border)'
                    : undefined,
                }}
              >
                <p className="text-sm font-medium">{question?.question.trim()}</p>

                <p className="text-[13px]">
                  {/* Correctness is text and icon, never colour alone. */}
                  <span className={result.isCorrect ? 'text-success' : 'text-danger'}>
                    {result.isCorrect ? '✓ Correct' : '✕ Incorrect'}
                  </span>
                  <span className="text-text-muted"> — ta réponse : {label(question, result.given)}</span>
                </p>

                {!result.isCorrect && result.correct !== undefined ? (
                  <p className="text-[13px] text-text-muted">
                    Bonne réponse : <span className="text-text">{label(question, result.correct)}</span>
                  </p>
                ) : null}

                {result.explanation ? (
                  <p className="text-sm leading-relaxed text-text-muted">{result.explanation.trim()}</p>
                ) : null}

                {result.reviewSkills.length > 0 ? (
                  <p className="flex flex-wrap items-center gap-2 text-[13px] text-text-subtle">
                    À revoir :
                    {result.reviewSkills.map((skill) => (
                      <Badge key={skill} tone="accent">
                        {skill}
                      </Badge>
                    ))}
                  </p>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/learn/${technology}/${chapter}/quiz`}
          className="inline-flex h-11 items-center rounded-control border border-border px-5 text-sm font-medium text-text no-underline"
        >
          Réessayer
        </Link>
        <Link
          href={`/learn/${technology}/${chapter}`}
          className="inline-flex h-11 items-center rounded-control bg-accent px-5 text-sm font-semibold text-accent-on no-underline"
        >
          Revenir au chapitre
        </Link>
      </div>
    </div>
  );
}
