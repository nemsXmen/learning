import type { XpSummary } from './xp.service';
import type { StreakView } from './streak.service';

/**
 * Definitions live in code, not in a table: they are content, versioned with the
 * app. A row per definition would only be a copy that can drift (CDC §25).
 */
export interface AchievementDefinition {
  code: string;
  title: string;
  description: string;
  icon: string;
}

export interface AchievementProgress {
  xp: XpSummary;
  streak: StreakView;
  masteredSkills: number;
  completedChapters: number;
}

interface Rule extends AchievementDefinition {
  earned: (progress: AchievementProgress) => boolean;
}

const RULES: Rule[] = [
  {
    code: 'FIRST_CHAPTER',
    title: 'Premier chapitre',
    description: 'Tu as terminé ton premier chapitre.',
    icon: 'book',
    earned: (p) => p.completedChapters >= 1,
  },
  {
    code: 'STREAK_7',
    title: '7 jours d’affilée',
    description: 'Sept jours consécutifs à apprendre.',
    icon: 'flame',
    earned: (p) => p.streak.currentDays >= 7,
  },
  {
    code: 'STREAK_30',
    title: '30 jours d’affilée',
    description: 'Un mois sans manquer un jour.',
    icon: 'flame',
    earned: (p) => p.streak.currentDays >= 30,
  },
  {
    code: 'LEVEL_10',
    title: 'Niveau 10',
    description: 'Tu as atteint le niveau 10.',
    icon: 'chevron-up',
    earned: (p) => p.xp.level >= 10,
  },
  {
    code: 'FIRST_MASTERY',
    title: 'Première maîtrise',
    description: 'Une compétence maîtrisée pour de bon.',
    icon: 'target',
    earned: (p) => p.masteredSkills >= 1,
  },
  {
    code: 'TEN_CHAPTERS',
    title: 'Dix chapitres',
    description: 'Dix chapitres terminés.',
    icon: 'library',
    earned: (p) => p.completedChapters >= 10,
  },
];

export const ACHIEVEMENTS: AchievementDefinition[] = RULES.map(({ earned: _earned, ...rest }) => rest);

/** Codes earned given this progress. Pure, so the rules are testable directly. */
export function earnedAchievements(progress: AchievementProgress): string[] {
  return RULES.filter((rule) => rule.earned(progress)).map((rule) => rule.code);
}

export function definitionOf(code: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.code === code);
}
