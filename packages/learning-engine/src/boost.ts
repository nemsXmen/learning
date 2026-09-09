import { PARAMETERS } from './parameters';
import { clamp, requireDate } from './numeric';
import { detectWeakSkills } from './priority';
import type { BoostInput, BoostPlan, BoostStep, QuestionRef } from './types';

const { boost: B } = PARAMETERS;

/** The shape of a Boost session, in order (CDC §17). */
const SEQUENCE: Array<BoostStep['kind']> = [
  'QUESTION',
  'EXPLANATION',
  'EXERCISE',
  'QUESTION',
  'MINI_TEST',
];

function minutesFor(kind: BoostStep['kind']): number {
  return B.stepMinutes[kind];
}

/**
 * Builds a 5–15 minute session out of the skills that most need attention.
 *
 * Deterministic: the same snapshot and the same clock always produce the same
 * plan, with ties broken on ids. The plan never exceeds the budget — a session
 * that overruns is a session the learner abandons.
 */
export function generateBoostSession(input: BoostInput): BoostPlan {
  requireDate('now', input.now);
  const budget = clamp(input.availableMinutes, B.minMinutes, B.maxMinutes);

  const weak = detectWeakSkills(input.skills, input.graph, input.now, B.maxTargetSkills);
  if (weak.length === 0) {
    return {
      targetSkillIds: [],
      steps: [],
      estimatedMinutes: 0,
      reason: 'Aucune compétence en retard ni en difficulté : rien à renforcer pour l’instant.',
    };
  }

  const bank = groupQuestions(input.questionBank);
  const steps: BoostStep[] = [];
  const used = new Set<string>();
  let spent = 0;

  // Round-robin across the targets so a session touches each of them.
  for (const kind of SEQUENCE) {
    for (const target of weak) {
      const cost = minutesFor(kind);
      if (spent + cost > budget) continue;

      const ref =
        kind === 'EXPLANATION' ? null : takeQuestion(bank.get(target.skillId), used);
      // A question step with nothing left to ask would be an empty screen.
      if (kind !== 'EXPLANATION' && ref === null) continue;

      steps.push({
        index: steps.length,
        kind,
        skillId: target.skillId,
        ref,
        estimatedMinutes: cost,
      });
      spent += cost;
    }
  }

  const targets = weak.map((entry) => entry.skillId);
  return {
    targetSkillIds: targets,
    steps,
    estimatedMinutes: spent,
    reason: buildReason(weak[0]?.reason ?? '', targets.length, spent),
  };
}

function groupQuestions(bank: QuestionRef[]): Map<string, QuestionRef[]> {
  const grouped = new Map<string, QuestionRef[]>();
  // Sorted by id so the selection order never depends on input order.
  for (const question of [...bank].sort((a, b) => a.questionId.localeCompare(b.questionId))) {
    const list = grouped.get(question.skillId) ?? [];
    list.push(question);
    grouped.set(question.skillId, list);
  }
  return grouped;
}

/** Never asks the same question twice in one session. */
function takeQuestion(pool: QuestionRef[] | undefined, used: Set<string>): string | null {
  const next = pool?.find((question) => !used.has(question.questionId));
  if (!next) return null;
  used.add(next.questionId);
  return next.questionId;
}

function buildReason(topReason: string, targetCount: number, minutes: number): string {
  const head =
    targetCount === 1
      ? 'Une compétence à renforcer'
      : `${targetCount} compétences à renforcer`;
  return `${head}, ${minutes} minutes. ${topReason}`.trim();
}
