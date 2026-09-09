import { PARAMETERS } from './parameters';
import type { XpEvent, XpResult } from './types';

const { xp: X } = PARAMETERS;

const LABELS: Record<string, string> = {
  CHAPTER_READ: 'Chapitre lu',
  QUIZ_PASSED: 'Quiz réussi',
  EXERCISE_COMPLETED: 'Exercice terminé',
  CHAPTER_TEST_PASSED: 'Test de chapitre réussi',
  BOOST_COMPLETED: 'Session Boost terminée',
  PROJECT_COMPLETED: 'Projet terminé',
  SCORE_IMPROVED: 'Score amélioré',
};

/**
 * CDC §25 gives the values, CDC §26 the anti-farming rule: the same effort is
 * never paid twice, and only a real improvement on a repeat earns anything.
 *
 * This function decides the amount; the ledger's uniqueness constraint is what
 * actually enforces it (docs/data-model.md).
 */
export function calculateXP(event: XpEvent): XpResult {
  if (event.alreadyRewarded && event.reason !== 'SCORE_IMPROVED') {
    return {
      amount: 0,
      reason: `${LABELS[event.reason] ?? event.reason} : déjà récompensé, relire ne rapporte rien.`,
    };
  }

  if (event.reason === 'SCORE_IMPROVED') {
    const previous = event.previousScore ?? 0;
    const next = event.newScore ?? 0;
    const gain = next - previous;

    if (gain < X.minimumImprovement) {
      return {
        amount: 0,
        reason: `Score passé de ${previous} % à ${next} % : trop peu pour compter comme une amélioration.`,
      };
    }
    return {
      amount: X.SCORE_IMPROVED,
      reason: `Score passé de ${previous} % à ${next} % : +${X.SCORE_IMPROVED} XP.`,
    };
  }

  const amount = X[event.reason];
  return { amount, reason: `${LABELS[event.reason] ?? event.reason} : +${amount} XP.` };
}
