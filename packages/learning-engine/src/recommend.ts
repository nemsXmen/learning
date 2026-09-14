import { PARAMETERS } from './parameters';
import { isDue } from './forgetting';
import { calculateReviewPriority } from './priority';
import { requireDate } from './numeric';
import type { ChapterRef, LearnerSnapshot, Recommendation, SkillSnapshot } from './types';

const { mastery: M, priority: P } = PARAMETERS;

/** A chapter unlocks when every prerequisite skill reaches the unlock threshold. */
export function isChapterUnlocked(chapter: ChapterRef, skills: SkillSnapshot[]): boolean {
  const byId = new Map(skills.map((skill) => [skill.skillId, skill]));
  return chapter.prerequisiteSkillIds.every(
    (skillId) => (byId.get(skillId)?.masteryScore ?? 0) >= M.unlockThreshold,
  );
}

/**
 * The next chapter to open: the one already started, else the first unlocked
 * chapter in order. Returns null when everything available is done.
 */
export function recommendNextChapter(
  chapters: ChapterRef[],
  skills: SkillSnapshot[],
): ChapterRef | null {
  const inProgress = chapters.find((chapter) => chapter.status === 'IN_PROGRESS');
  if (inProgress) return inProgress;

  return (
    chapters.find(
      (chapter) => chapter.status === 'NOT_STARTED' && isChapterUnlocked(chapter, skills),
    ) ?? null
  );
}

/**
 * The single question the product exists to answer (CDC §88): what should I do
 * right now to progress fastest?
 *
 * An overdue high-priority review wins over a new chapter — continuing on a
 * cracked foundation is how learners plateau (CDC §14). Every branch carries the
 * reason that decided it, phrased for the screen (CDC §66, §78).
 */
export function recommendNextAction(input: LearnerSnapshot): Recommendation {
  requireDate('now', input.now);

  const priorities = input.skills
    .map((skill) => ({ skill, priority: calculateReviewPriority(skill, input.graph, input.now) }))
    .sort(
      (a, b) =>
        b.priority.priority - a.priority.priority ||
        a.skill.skillId.localeCompare(b.skill.skillId),
    );

  const urgent = priorities.find(
    (entry) => isDue(entry.skill, input.now) && entry.priority.priority >= P.mediumBand,
  );

  if (urgent) {
    return {
      type: 'BOOST',
      ref: urgent.skill.skillId,
      estimatedMinutes: Math.min(input.availableMinutes, PARAMETERS.boost.maxMinutes),
      priority: urgent.priority.priority,
      reason: urgent.priority.reason,
    };
  }

  const chapter = recommendNextChapter(input.chapters, input.skills);
  if (chapter) {
    const continuing = chapter.status === 'IN_PROGRESS';
    return {
      type: 'NEXT_CHAPTER',
      ref: chapter.chapterId,
      estimatedMinutes: chapter.estimatedMinutes,
      priority: 0,
      reason: continuing
        ? 'Tu as un chapitre en cours : le terminer vaut mieux que d’en ouvrir un autre.'
        : 'Tes prérequis sont acquis : ce chapitre est la suite logique.',
    };
  }

  // Nothing due and nothing unlocked left: say so rather than inventing an action.
  const weakest = priorities.find((entry) => entry.skill.masteryScore < M.masteredThreshold);
  if (weakest) {
    return {
      type: 'REVIEW',
      ref: weakest.skill.skillId,
      estimatedMinutes: Math.min(input.availableMinutes, PARAMETERS.boost.maxMinutes),
      priority: weakest.priority.priority,
      reason: `Rien de nouveau à débloquer pour l’instant. ${weakest.priority.reason}`,
    };
  }

  return {
    type: 'CAUGHT_UP',
    ref: null,
    estimatedMinutes: 0,
    priority: 0,
    reason: 'Tout est à jour : aucune révision due et aucun chapitre en attente.',
  };
}
