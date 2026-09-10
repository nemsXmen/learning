import type { PriorityBand } from '@app/types';
import { PARAMETERS } from './parameters';
import { calculateForgettingRisk } from './forgetting';
import { clampUnit, requireDate, withFloor } from './numeric';
import type { PriorityResult, SkillGraph, SkillSnapshot } from './types';

const { priority: P } = PARAMETERS;

/** How many skills would be held back if this one stays weak. */
export function prerequisiteImpact(skillId: string, graph: SkillGraph): number {
  let dependants = 0;
  for (const requires of Object.values(graph.requires)) {
    if (requires.includes(skillId)) dependants += 1;
  }
  return clampUnit(dependants / P.prerequisiteSaturation);
}

function bandFor(priority: number): PriorityBand {
  if (priority >= P.highBand) return 'high';
  if (priority >= P.mediumBand) return 'medium';
  return 'low';
}

/**
 * CDC §15: priority = weakness × forgettingRisk × importance × prerequisiteImpact.
 *
 * Taken literally, a product lets one factor zero the result — a genuinely weak
 * skill reviewed this morning would vanish. So every factor except weakness is
 * lifted into [floor, 1] before multiplying: the shape of the formula is kept,
 * the collapse is not. Weakness alone may still zero it, which is correct: a
 * mastered skill needs nothing.
 */
export function calculateReviewPriority(
  skill: SkillSnapshot,
  graph: SkillGraph,
  now: Date,
): PriorityResult {
  requireDate('now', now);

  const weakness = clampUnit(1 - skill.masteryScore / 100);
  const forgettingRisk = calculateForgettingRisk(skill, now);
  const importance = clampUnit((skill.importance - 1) / 4);
  const impact = prerequisiteImpact(skill.skillId, graph);

  const priority = clampUnit(
    Math.pow(weakness, P.weaknessWeight) *
      Math.pow(withFloor(forgettingRisk, P.factorFloor), P.forgettingWeight) *
      Math.pow(withFloor(importance, P.factorFloor), P.importanceWeight) *
      Math.pow(withFloor(impact, P.factorFloor), P.prerequisiteWeight),
  );

  return {
    skillId: skill.skillId,
    priority,
    band: bandFor(priority),
    factors: { weakness, forgettingRisk, importance, prerequisiteImpact: impact },
    estimatedMinutes: estimateMinutes(priority),
    reason: buildReason(skill, forgettingRisk, impact),
  };
}

/**
 * A more urgent skill needs longer: the estimate rises with priority, between
 * a quick refresher and a full review. Bounded so a plan can be built from it.
 */
function estimateMinutes(priority: number): number {
  const { minMinutes, maxMinutes } = PARAMETERS.reviewEstimate;
  return Math.round(minMinutes + clampUnit(priority) * (maxMinutes - minMinutes));
}

function buildReason(skill: SkillSnapshot, forgettingRisk: number, impact: number): string {
  const parts: string[] = [`Ton score est de ${Math.round(skill.masteryScore)} %`];

  if (skill.failureCount > 0) {
    parts.push(
      `tu as échoué ${skill.failureCount} fois sur cette compétence`,
    );
  }
  if (forgettingRisk > 0.5) {
    parts.push('et tu ne l’as pas revue depuis longtemps');
  }
  if (impact > 0) {
    parts.push('elle conditionne la suite du parcours');
  }

  return `${parts.join(', ')}.`;
}

/**
 * The skills that need attention, most urgent first. Ties break on skill id so
 * two runs never disagree.
 */
export function detectWeakSkills(
  skills: SkillSnapshot[],
  graph: SkillGraph,
  now: Date,
  limit = 3,
): PriorityResult[] {
  return skills
    .filter((skill) => skill.masteryScore < PARAMETERS.mastery.weakThreshold)
    .map((skill) => calculateReviewPriority(skill, graph, now))
    .sort((a, b) => b.priority - a.priority || a.skillId.localeCompare(b.skillId))
    .slice(0, Math.max(0, limit));
}
