import { PARAMETERS } from './parameters';
import { clampUnit, daysBetween, requireDate } from './numeric';
import type { SkillSnapshot } from './types';

const { forgetting: F } = PARAMETERS;

/**
 * How likely the learner has lost this skill since they last practised it.
 *
 * An exponential decay whose stability grows with each review and with mastery:
 * something learned once fades in days, something reviewed five times holds for
 * weeks (CDC §16).
 */
export function calculateForgettingRisk(skill: SkillSnapshot, now: Date): number {
  requireDate('now', now);

  const anchor = skill.lastReviewedAt ?? skill.lastAttemptAt;
  // Never practised: there is nothing to forget yet. Weakness, not decay, is what
  // should make such a skill surface.
  if (!anchor) return 0;

  const days = daysBetween(anchor, now);
  const stability =
    F.baseStabilityDays *
      (1 + skill.reviewCount * F.stabilityPerReview) +
    (skill.masteryScore / 100) * F.stabilityFromMasteryDays;

  return clampUnit(1 - Math.exp(-days / stability));
}

/** True when the scheduled review date has passed. */
export function isDue(skill: SkillSnapshot, now: Date): boolean {
  requireDate('now', now);
  if (!skill.nextReviewAt) return false;
  return skill.nextReviewAt.getTime() <= now.getTime();
}

export function daysOverdue(skill: SkillSnapshot, now: Date): number {
  if (!skill.nextReviewAt) return 0;
  return daysBetween(skill.nextReviewAt, now);
}
