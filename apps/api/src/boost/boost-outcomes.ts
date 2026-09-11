import type { BoostPlan } from '@app/learning-engine';

/** What the learner answered, step by step, as stored on the session. */
export type BoostAnswer = { index: number; correct: boolean };

/**
 * A Boost session is a fact that moves mastery, exactly like a quiz attempt, so
 * the replay has to read it too. Grading lives here rather than inside
 * BoostService so the live path and `mastery:replay` cannot drift: if the two
 * ever disagreed, replaying would silently rewrite history
 * (features/10-skill-mastery-and-review/CONTRACT.md).
 */

/** A session passes at the same bar as a chapter quiz. */
export const BOOST_PASS_PERCENT = 60;

/** Explanation steps carry no `ref` and are never graded. */
function isGraded(plan: BoostPlan, index: number): boolean {
  return plan.steps[index]?.ref !== null && plan.steps[index] !== undefined;
}

export function boostScorePercent(plan: BoostPlan, answers: BoostAnswer[]): number {
  const graded = plan.steps.filter((step) => step.ref !== null);
  if (graded.length === 0) return 0;

  const correct = answers.filter((answer) => isGraded(plan, answer.index) && answer.correct).length;
  return Math.round((correct / graded.length) * 100);
}

export function boostSkillOutcomes(
  plan: BoostPlan,
  answers: BoostAnswer[],
): Array<{ skillId: string; correct: number; incorrect: number }> {
  const tally = new Map<string, { skillId: string; correct: number; incorrect: number }>();

  for (const answer of answers) {
    const step = plan.steps[answer.index];
    if (!step || step.ref === null) continue;

    const entry = tally.get(step.skillId) ?? { skillId: step.skillId, correct: 0, incorrect: 0 };
    if (answer.correct) entry.correct += 1;
    else entry.incorrect += 1;
    tally.set(step.skillId, entry);
  }

  return [...tally.values()];
}
