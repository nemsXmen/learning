import type {
  DifficultyBand,
  PriorityBand,
  RecommendationType,
  Scale5,
  XpReason,
} from '@app/types';

/** Everything the engine knows about one skill for one learner. */
export interface SkillSnapshot {
  skillId: string;
  masteryScore: number; // 0..100
  confidenceScore: number; // 0..100
  successCount: number;
  failureCount: number;
  difficulty: Scale5;
  importance: Scale5;
  /** Null when the learner has never been tested on this skill. */
  lastAttemptAt: Date | null;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  reviewCount: number;
  /** Days until the next review; 0 when none has been scheduled yet. */
  intervalDays: number;
}

/** What one graded attempt says about one skill. */
export interface AttemptOutcome {
  skillId: string;
  correct: number;
  incorrect: number;
}

export interface MasteryResult {
  masteryScore: number;
  confidenceScore: number;
  delta: number;
  reason: string;
}

export interface PriorityFactors {
  weakness: number; // 0..1
  forgettingRisk: number; // 0..1
  importance: number; // 0..1
  prerequisiteImpact: number; // 0..1
}

export interface PriorityResult {
  skillId: string;
  priority: number; // 0..1
  band: PriorityBand;
  factors: PriorityFactors;
  reason: string;
}

export interface ReviewSchedule {
  intervalDays: number;
  nextReviewAt: Date;
  reason: string;
}

/** The skill graph, as edges from a skill to the skills it requires. */
export interface SkillGraph {
  requires: Record<string, string[]>;
}

export type BoostStepKind = 'QUESTION' | 'EXPLANATION' | 'EXERCISE' | 'MINI_TEST';

export interface QuestionRef {
  questionId: string;
  skillId: string;
  difficulty: Scale5;
  estimatedMinutes: number;
}

export interface BoostStep {
  index: number;
  kind: BoostStepKind;
  skillId: string;
  ref: string | null;
  estimatedMinutes: number;
}

export interface BoostPlan {
  targetSkillIds: string[];
  steps: BoostStep[];
  estimatedMinutes: number;
  reason: string;
}

export interface BoostInput {
  skills: SkillSnapshot[];
  graph: SkillGraph;
  availableMinutes: number;
  questionBank: QuestionRef[];
  now: Date;
}

/** A chapter as the engine sees it: ids and prerequisites, never prose. */
export interface ChapterRef {
  chapterId: string;
  technologySlug: string;
  estimatedMinutes: number;
  skillIds: string[];
  prerequisiteSkillIds: string[];
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface LearnerSnapshot {
  skills: SkillSnapshot[];
  graph: SkillGraph;
  chapters: ChapterRef[];
  availableMinutes: number;
  now: Date;
}

/**
 * `CAUGHT_UP` is the seventh state the CDC's six recommendation types do not
 * cover: nothing is due and nothing is left to unlock. Every screen still needs
 * one thing to say (CDC §81), so it is a recommendation, not an absence of one.
 */
export interface Recommendation {
  type: RecommendationType | 'CAUGHT_UP';
  ref: string | null;
  estimatedMinutes: number;
  priority: number;
  reason: string;
}

export interface XpEvent {
  reason: XpReason;
  /** True when this exact effort was already rewarded (CDC §26). */
  alreadyRewarded: boolean;
  /** For SCORE_IMPROVED: the previous and new percentages. */
  previousScore?: number;
  newScore?: number;
}

export interface XpResult {
  amount: number;
  reason: string;
}

export interface StreakState {
  currentDays: number;
  longestDays: number;
  /** Local calendar day, `YYYY-MM-DD`. */
  lastActiveDate: string | null;
}

export interface StreakResult extends StreakState {
  changed: boolean;
  reason: string;
}

export interface DifficultyResult {
  band: DifficultyBand;
  reason: string;
}

/** Thrown at the package boundary; never used to signal ordinary outcomes. */
export class EngineInputError extends Error {
  constructor(
    readonly field: string,
    message: string,
  ) {
    super(message);
    this.name = 'EngineInputError';
  }
}
