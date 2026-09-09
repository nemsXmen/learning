import { PARAMETERS } from './parameters';
import { clampPercent, clampUnit, requireDate, requireRange, round1 } from './numeric';
import type { AttemptOutcome, MasteryResult, SkillSnapshot } from './types';

const { mastery: M, confidence: C } = PARAMETERS;

/**
 * Confidence answers "how much do we trust this mastery score", not "how good is
 * the learner". It rises with evidence and falls when the score disagrees with
 * the raw success ratio.
 */
export function calculateConfidence(
  masteryScore: number,
  successCount: number,
  failureCount: number,
): number {
  const answers = successCount + failureCount;
  if (answers === 0) return 0;

  const evidence = answers / (answers + C.evidenceHalfLife);
  const successRatio = successCount / answers;
  const agreement = 1 - Math.abs(masteryScore / 100 - successRatio);

  return clampPercent(100 * evidence * clampUnit(agreement));
}

/**
 * Moves mastery a fraction of the way towards what this attempt showed.
 * Harder skills move further; repeated evidence moves less, so a score stops
 * swinging once it is established.
 */
export function calculateMastery(
  previous: SkillSnapshot,
  outcome: AttemptOutcome,
  now: Date,
): MasteryResult {
  requireDate('now', now);
  requireRange('previous.masteryScore', previous.masteryScore, 0, 100);
  requireRange('outcome.correct', outcome.correct, 0, Number.MAX_SAFE_INTEGER);
  requireRange('outcome.incorrect', outcome.incorrect, 0, Number.MAX_SAFE_INTEGER);

  const answers = outcome.correct + outcome.incorrect;
  if (answers === 0) {
    return {
      masteryScore: previous.masteryScore,
      confidenceScore: previous.confidenceScore,
      delta: 0,
      reason: 'Aucune réponse à cette compétence : la maîtrise est inchangée.',
    };
  }

  const attemptScore = (outcome.correct / answers) * 100;
  const difficultyFactor = 1 + (previous.difficulty - 3) * M.difficultyWeight;
  const damping = 1 / (1 + previous.reviewCount * M.diminishingPerReview);
  const rate = M.baseGainRate * difficultyFactor * damping;

  const rawDelta = (attemptScore - previous.masteryScore) * rate;
  const delta = Math.max(-M.maxDeltaPerAttempt, Math.min(M.maxDeltaPerAttempt, rawDelta));
  const masteryScore = clampPercent(previous.masteryScore + delta);

  const successCount = previous.successCount + outcome.correct;
  const failureCount = previous.failureCount + outcome.incorrect;
  const confidenceScore = calculateConfidence(masteryScore, successCount, failureCount);

  return {
    masteryScore: round1(masteryScore),
    confidenceScore: round1(confidenceScore),
    delta: round1(delta),
    reason: buildReason(outcome, attemptScore, delta, previous),
  };
}

function buildReason(
  outcome: AttemptOutcome,
  attemptScore: number,
  delta: number,
  previous: SkillSnapshot,
): string {
  const answers = outcome.correct + outcome.incorrect;
  const scored = `${outcome.correct}/${answers} (${Math.round(attemptScore)} %)`;

  if (delta > 0) {
    return `Score de ${scored} sur cette session, au-dessus de ta maîtrise de ${Math.round(previous.masteryScore)} % : la maîtrise progresse.`;
  }
  if (delta < 0) {
    return `Score de ${scored}, en dessous de ta maîtrise de ${Math.round(previous.masteryScore)} % : la maîtrise recule.`;
  }
  return `Score de ${scored}, conforme à ta maîtrise actuelle.`;
}

/**
 * Finishing a chapter is evidence, but weaker than answering questions about it
 * (CDC §11: reading is not mastery).
 */
export function applyChapterCompletion(previous: SkillSnapshot, now: Date): MasteryResult {
  const full = calculateMastery(previous, { skillId: previous.skillId, correct: 1, incorrect: 0 }, now);
  const delta = round1(full.delta * M.chapterCompletionWeight);
  const masteryScore = round1(clampPercent(previous.masteryScore + delta));

  return {
    masteryScore,
    confidenceScore: previous.confidenceScore,
    delta,
    reason: 'Chapitre terminé : la lecture compte, mais moins qu’un test réussi.',
  };
}

export function isMastered(masteryScore: number): boolean {
  return masteryScore >= M.masteredThreshold;
}

export function isWeak(masteryScore: number): boolean {
  return masteryScore < M.weakThreshold;
}
