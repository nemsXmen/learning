import type { AttemptSummary, ChapterPayload, ChapterProgress } from '../../../../lib/catalog';

/**
 * What the reader should do after this chapter, decided in one place.
 *
 * The loop of CDC §1 only holds if every screen answers "what should I do next"
 * (rules.md #11). The chapter page used to end on a previous/next pair, which
 * left the chapter test reachable by URL only — the "Tester" step was written
 * but had no door.
 */

export type NextStepTone = 'primary' | 'secondary' | 'done';

export interface NextStep {
  tone: NextStepTone;
  title: string;
  body: string;
  /** The call to action, absent when there is nothing to do here. */
  action: { label: string; href: string } | null;
  /** Shown as a secondary line when the learner already has a score. */
  bestScore: number | null;
  attemptCount: number;
}

function bestOf(attempts: AttemptSummary[]): number | null {
  const scored = attempts
    .filter((attempt) => attempt.submittedAt !== null && attempt.scorePercent !== null)
    .map((attempt) => attempt.scorePercent as number);
  return scored.length === 0 ? null : Math.max(...scored);
}

export function decideNextStep(input: {
  technologySlug: string;
  chapter: Pick<ChapterPayload, 'slug' | 'quiz'>;
  progress: ChapterProgress | null;
  attempts: AttemptSummary[];
  /** The next chapter, when one exists and is reachable. */
  nextChapter: { slug: string; title: string; locked: boolean } | null;
}): NextStep {
  const { technologySlug, chapter, progress, attempts, nextChapter } = input;
  const quizHref = `/learn/${technologySlug}/${chapter.slug}/quiz`;
  const readingDone = progress?.status === 'COMPLETED';

  // A chapter without a written test still has to point somewhere.
  if (!chapter.quiz) {
    if (nextChapter && !nextChapter.locked) {
      return {
        tone: readingDone ? 'primary' : 'secondary',
        title: 'Pas encore de test sur ce chapitre',
        body: `Tu peux enchaîner sur « ${nextChapter.title} ».`,
        action: { label: 'Chapitre suivant', href: `/learn/${technologySlug}/${nextChapter.slug}` },
        bestScore: null,
        attemptCount: 0,
      };
    }
    return {
      tone: 'secondary',
      title: 'Pas encore de test sur ce chapitre',
      body: 'Le test arrivera avec la prochaine version du contenu.',
      action: null,
      bestScore: null,
      attemptCount: 0,
    };
  }

  const submitted = attempts.filter((attempt) => attempt.submittedAt !== null);
  const best = bestOf(submitted);
  const passed = submitted.some((attempt) => attempt.passed === true);
  const questions = chapter.quiz.questionCount;

  if (passed) {
    const body = nextChapter
      ? nextChapter.locked
        ? 'La suite se débloquera quand tes compétences seront assez solides. Retenter le test les fait progresser.'
        : `Tu peux enchaîner sur « ${nextChapter.title} ».`
      : 'Tu as terminé le dernier chapitre de ce module.';

    return {
      tone: 'done',
      title: 'Test réussi',
      body,
      action:
        nextChapter && !nextChapter.locked
          ? { label: 'Chapitre suivant', href: `/learn/${technologySlug}/${nextChapter.slug}` }
          : { label: 'Refaire le test', href: quizHref },
      bestScore: best,
      attemptCount: submitted.length,
    };
  }

  if (submitted.length > 0) {
    return {
      tone: 'primary',
      title: 'Retente le test',
      body: 'Tu y étais presque. Les questions ratées portent sur les compétences à renforcer.',
      action: { label: 'Retenter le test', href: quizHref },
      bestScore: best,
      attemptCount: submitted.length,
    };
  }

  // Never attempted: the reading state only changes the tone, never the door.
  return {
    tone: readingDone ? 'primary' : 'secondary',
    title: readingDone ? 'Teste-toi sur ce chapitre' : 'Le test t’attend',
    body: readingDone
      ? `${questions} question${questions > 1 ? 's' : ''}, corrigées avec une explication pour chaque erreur.`
      : `Tu peux le passer quand tu veux — ${questions} question${questions > 1 ? 's' : ''}, corrigées une par une.`,
    action: { label: 'Passer le test', href: quizHref },
    bestScore: null,
    attemptCount: 0,
  };
}
