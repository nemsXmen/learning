import { describe, expect, it } from 'vitest';
import {
  applyChapterCompletion,
  calculateForgettingRisk,
  calculateMastery,
  isChapterUnlocked,
  isDue,
  isMastered,
  isWeak,
  scheduleNextReview,
  type ChapterRef,
  type SkillSnapshot,
} from './index';

/**
 * Trajectories: what happens to one learner over days, told as a sequence of
 * events. engine.test.ts checks each rule alone; these check that the rules add
 * up to the product the CDC describes, and they are what the coefficients in
 * parameters.ts are tuned against. A coefficient change that moves one of these
 * is a product change, and should read as one here.
 */

const DAY = 86_400_000;
const START = new Date('2026-09-01T09:00:00Z');
const dayAt = (day: number) => new Date(START.getTime() + day * DAY);

/** The quiz pass mark. It belongs to the API (quiz/grade.ts), not to the engine. */
const PASS_PERCENT = 60;

function fresh(skillId = 'variables'): SkillSnapshot {
  return {
    skillId,
    masteryScore: 0,
    confidenceScore: 0,
    successCount: 0,
    failureCount: 0,
    difficulty: 3,
    importance: 3,
    lastAttemptAt: null,
    lastReviewedAt: null,
    nextReviewAt: null,
    reviewCount: 0,
    intervalDays: 0,
  };
}

/** Folds one graded attempt into a skill, the way MasteryService does live. */
function attempt(skill: SkillSnapshot, correct: number, incorrect: number, now: Date): SkillSnapshot {
  const mastery = calculateMastery(skill, { skillId: skill.skillId, correct, incorrect }, now);
  const passed = (correct / (correct + incorrect)) * 100 >= PASS_PERCENT;
  const schedule = scheduleNextReview({ ...skill, masteryScore: mastery.masteryScore }, passed, now);

  return {
    ...skill,
    masteryScore: mastery.masteryScore,
    confidenceScore: mastery.confidenceScore,
    successCount: skill.successCount + correct,
    failureCount: skill.failureCount + incorrect,
    reviewCount: skill.reviewCount + 1,
    intervalDays: schedule.intervalDays,
    lastAttemptAt: now,
    lastReviewedAt: now,
    nextReviewAt: schedule.nextReviewAt,
  };
}

function complete(skill: SkillSnapshot, now: Date): SkillSnapshot {
  const result = applyChapterCompletion(skill, now);
  return { ...skill, masteryScore: result.masteryScore, confidenceScore: result.confidenceScore, lastAttemptAt: now };
}

/** A four-question quiz, all correct. */
const perfect = (skill: SkillSnapshot, now: Date) => attempt(skill, 4, 0, now);

/** The chapter that follows, gated on the skill being learned. */
const NEXT_CHAPTER: ChapterRef = {
  chapterId: 'javascript-functions',
  technologySlug: 'javascript',
  estimatedMinutes: 25,
  skillIds: ['functions'],
  prerequisiteSkillIds: ['variables'],
  status: 'NOT_STARTED',
};
const unlocks = (skill: SkillSnapshot) => isChapterUnlocked(NEXT_CHAPTER, [skill]);

describe('un apprenant qui lit, puis se teste', () => {
  it('lire le chapitre compte, mais ne débloque jamais la suite à lui seul', () => {
    const read = complete(fresh(), dayAt(0));

    expect(read.masteryScore).toBeGreaterThan(0);
    expect(unlocks(read)).toBe(false);
  });

  it('lire le chapitre puis réussir son test une fois débloque la suite', () => {
    // The unlock rule, written down. It used to take three perfect tests (8.8 → 33.8 →
    // 58.8 → 72.4 % against a 60 % threshold), which left almost all of Part 1 locked
    // for a new learner; at 30 % one pass after reading is enough (docs/decisions.md).
    let skill = complete(fresh(), dayAt(0));
    expect(unlocks(skill)).toBe(false);

    skill = perfect(skill, dayAt(0));
    expect(unlocks(skill)).toBe(true);
  });

  it('un test réussi de justesse après lecture suffit aussi', () => {
    const skill = attempt(complete(fresh(), dayAt(0)), 3, 1, dayAt(0)); // 75 %
    expect(unlocks(skill)).toBe(true);
  });

  it('un test raté ne débloque pas, même après lecture', () => {
    const skill = attempt(complete(fresh(), dayAt(0)), 2, 2, dayAt(0)); // 50 %
    expect(unlocks(skill)).toBe(false);
  });

  it('sans lecture, un test parfait ne suffit pas du premier coup', () => {
    // Reading still counts: skipping the chapter costs a second attempt.
    let skill = perfect(fresh(), dayAt(0));
    expect(unlocks(skill)).toBe(false);

    skill = perfect(skill, dayAt(1));
    expect(unlocks(skill)).toBe(true);
  });

  it('la compétence est maîtrisée au quatrième test parfait, pas avant', () => {
    let skill = complete(fresh(), dayAt(0));
    const scores: number[] = [];
    for (let day = 0; day < 4; day += 1) {
      skill = perfect(skill, dayAt(day));
      scores.push(skill.masteryScore);
    }

    expect(scores.slice(0, 3).some(isMastered)).toBe(false);
    expect(isMastered(scores[3] as number)).toBe(true);
  });

  it('chaque réussite rapporte moins que la précédente : un score établi ne bouge plus', () => {
    let skill = fresh();
    const gains: number[] = [];
    for (let day = 0; day < 8; day += 1) {
      const before = skill.masteryScore;
      skill = perfect(skill, dayAt(day));
      gains.push(skill.masteryScore - before);
    }

    // Within the tenth the engine rounds to.
    for (let i = 1; i < gains.length; i += 1) {
      expect(gains[i] as number).toBeLessThanOrEqual((gains[i - 1] as number) + 0.1);
    }
    expect(skill.masteryScore).toBeLessThanOrEqual(100);
    expect(skill.confidenceScore).toBeGreaterThan(0);
  });

  it('un échec complet fait reculer la maîtrise et ramène la compétence parmi les faibles', () => {
    let skill = complete(fresh(), dayAt(0));
    for (let day = 0; day < 3; day += 1) skill = perfect(skill, dayAt(day));
    expect(isWeak(skill.masteryScore)).toBe(false);

    const before = skill.masteryScore;
    skill = attempt(skill, 0, 4, dayAt(3));

    expect(skill.masteryScore).toBeLessThan(before);
    expect(isWeak(skill.masteryScore)).toBe(true);
  });
});

describe('la révision espacée', () => {
  it('chaque révision réussie à sa date monte d’un barreau : 1, 3, 7, 14, 30, puis 60 jours', () => {
    let skill = fresh();
    let now = dayAt(0);
    const intervals: number[] = [];
    for (let review = 0; review < 7; review += 1) {
      skill = perfect(skill, now);
      intervals.push(skill.intervalDays);
      now = skill.nextReviewAt as Date;
    }

    expect(intervals).toEqual([1, 3, 7, 14, 30, 60, 60]);
  });

  it('une révision n’est due qu’à sa date, pas avant', () => {
    const skill = perfect(perfect(fresh(), dayAt(0)), dayAt(1)); // next review three days after day 1

    expect(isDue(skill, dayAt(3))).toBe(false);
    expect(isDue(skill, dayAt(4))).toBe(true);
  });

  it('un échec resserre l’intervalle au lieu de tout reprendre à zéro', () => {
    let skill = fresh();
    let now = dayAt(0);
    for (let review = 0; review < 5; review += 1) {
      skill = perfect(skill, now);
      now = skill.nextReviewAt as Date;
    }
    expect(skill.intervalDays).toBe(30);

    skill = attempt(skill, 0, 4, now);
    expect(skill.intervalDays).toBe(10);
  });
});

describe('l’oubli', () => {
  it('le risque grandit avec le temps écoulé depuis la dernière révision', () => {
    const skill = perfect(fresh(), dayAt(0));
    const risks = [1, 3, 7, 14].map((day) => calculateForgettingRisk(skill, dayAt(day)));

    for (let i = 1; i < risks.length; i += 1) {
      expect(risks[i] as number).toBeGreaterThan(risks[i - 1] as number);
    }
  });

  it('une compétence révisée plusieurs fois tient plus longtemps qu’une compétence vue une fois', () => {
    const once = perfect(fresh(), dayAt(0));
    let practised = fresh();
    for (let day = 0; day < 5; day += 1) practised = perfect(practised, dayAt(day));

    // A week after each one's last review.
    expect(calculateForgettingRisk(practised, dayAt(4 + 7))).toBeLessThan(
      calculateForgettingRisk(once, dayAt(7)),
    );
  });

  it('une compétence jamais pratiquée n’a rien à oublier', () => {
    expect(calculateForgettingRisk(fresh(), dayAt(30))).toBe(0);
  });
});
