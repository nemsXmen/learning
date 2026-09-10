import { PARAMETERS } from './parameters';

const { levels: L } = PARAMETERS;

export interface LevelProgress {
  level: number;
  /** Total XP at which the current level started. */
  levelStartXp: number;
  /** Total XP needed to reach the next level; null at the ceiling. */
  nextLevelXp: number | null;
  /** How far through the current level, 0..100. */
  levelProgressPercent: number;
  /** XP still needed for the next level; 0 at the ceiling. */
  xpToNextLevel: number;
}

/**
 * Cumulative XP required to have reached `level`. Level 1 starts at zero, and
 * each level costs more than the last.
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  const capped = Math.min(level, L.maxLevel);
  return Math.round(L.baseXp * Math.pow(capped - 1, L.exponent));
}

/**
 * Level from total XP. A pure function of one number, so the same total always
 * gives the same level and the curve can be changed in one place.
 */
export function levelForXp(totalXp: number): LevelProgress {
  const total = Math.max(0, Math.floor(totalXp));

  let level = 1;
  while (level < L.maxLevel && total >= xpForLevel(level + 1)) level += 1;

  const levelStartXp = xpForLevel(level);
  const nextLevelXp = level >= L.maxLevel ? null : xpForLevel(level + 1);

  if (nextLevelXp === null) {
    return { level, levelStartXp, nextLevelXp, levelProgressPercent: 100, xpToNextLevel: 0 };
  }

  const span = nextLevelXp - levelStartXp;
  return {
    level,
    levelStartXp,
    nextLevelXp,
    levelProgressPercent: span <= 0 ? 100 : Math.round(((total - levelStartXp) / span) * 100),
    xpToNextLevel: Math.max(0, nextLevelXp - total),
  };
}
