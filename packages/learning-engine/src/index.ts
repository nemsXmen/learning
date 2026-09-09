/**
 * Pure pedagogical decisions: mastery, forgetting risk, review priority,
 * recommendations, XP, streak, boost plans.
 *
 * No I/O, no clock, no framework types — the clock is always an input, which is
 * what makes every rule here testable in isolation (CDC §64, §67, §89.10).
 */
export { PARAMETERS } from './parameters';
export type { Parameters } from './parameters';

export * from './types';

export { calculateMastery, calculateConfidence, applyChapterCompletion, isMastered, isWeak } from './mastery';
export { calculateForgettingRisk, isDue, daysOverdue } from './forgetting';
export { calculateReviewPriority, detectWeakSkills, prerequisiteImpact } from './priority';
export { scheduleNextReview, adjustDifficulty } from './review';
export { calculateXP } from './xp';
export { updateStreak, localDay, isStreakAtRisk } from './streak';
export { generateBoostSession } from './boost';
export { recommendNextAction, recommendNextChapter, isChapterUnlocked } from './recommend';
