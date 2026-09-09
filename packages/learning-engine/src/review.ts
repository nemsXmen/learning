import type { DifficultyBand } from '@app/types';
import { PARAMETERS } from './parameters';
import { clamp, requireDate } from './numeric';
import type { DifficultyResult, ReviewSchedule, SkillSnapshot } from './types';

const { review: R, difficulty: D } = PARAMETERS;

const LADDER: readonly number[] = R.ladderDays;

function nextRungAfter(intervalDays: number): number {
  const next = LADDER.find((rung) => rung > intervalDays);
  return next ?? (LADDER[LADDER.length - 1] as number);
}

/**
 * Spaced repetition on the CDC §16 ladder: 1, 3, 7, 14, 30, 60 days. A success
 * moves to the next rung, a failure divides the interval — the intervals evolve
 * with the results rather than following a fixed calendar.
 */
export function scheduleNextReview(
  skill: SkillSnapshot,
  passed: boolean,
  now: Date,
): ReviewSchedule {
  requireDate('now', now);

  const current = Math.max(0, skill.intervalDays);
  const intervalDays = passed
    ? clamp(nextRungAfter(current), R.minIntervalDays, R.maxIntervalDays)
    : clamp(Math.floor(current / R.failureDivisor), R.minIntervalDays, R.maxIntervalDays);

  const nextReviewAt = new Date(now.getTime() + intervalDays * 86_400_000);

  return {
    intervalDays,
    nextReviewAt,
    reason: passed
      ? `Réussi : la prochaine révision passe de ${current || 0} à ${intervalDays} jours.`
      : `Échoué : la prochaine révision se resserre à ${intervalDays} jour${intervalDays > 1 ? 's' : ''}.`,
  };
}

/**
 * Adaptive difficulty (CDC §77), clamped to the four named bands. Movement needs
 * a run, not a single answer, so one lucky guess does not jump a learner two
 * levels.
 */
export function adjustDifficulty(
  band: DifficultyBand,
  consecutiveSuccesses: number,
  consecutiveFailures: number,
): DifficultyResult {
  const bands = D.bands as readonly DifficultyBand[];
  const index = Math.max(0, bands.indexOf(band));

  if (consecutiveFailures >= D.demoteAfterFailures) {
    const next = bands[Math.max(0, index - 1)] as DifficultyBand;
    return {
      band: next,
      reason:
        next === band
          ? 'Déjà au niveau le plus accessible : la difficulté ne descend pas davantage.'
          : `${consecutiveFailures} échec(s) d’affilée : la difficulté passe à « ${next} ».`,
    };
  }

  if (consecutiveSuccesses >= D.promoteAfterSuccesses) {
    const next = bands[Math.min(bands.length - 1, index + 1)] as DifficultyBand;
    return {
      band: next,
      reason:
        next === band
          ? 'Déjà au niveau le plus élevé : la difficulté ne monte pas davantage.'
          : `${consecutiveSuccesses} réussites d’affilée : la difficulté passe à « ${next} ».`,
    };
  }

  return { band, reason: 'Pas assez de résultats consécutifs pour changer de niveau.' };
}
