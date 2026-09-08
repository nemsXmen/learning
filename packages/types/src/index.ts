/**
 * Domain vocabulary shared by every workspace package.
 *
 * Zero runtime dependencies on purpose: `learning-engine` imports this and must
 * stay free of frameworks, I/O and third-party code (docs/rules.md #7).
 */

export const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
export type Level = (typeof LEVELS)[number];

export const DIFFICULTY_BANDS = ['easy', 'medium', 'hard', 'expert'] as const;
export type DifficultyBand = (typeof DIFFICULTY_BANDS)[number];

/** 1..5, as authored in chapter frontmatter and `skills.yaml`. */
export type Scale5 = 1 | 2 | 3 | 4 | 5;

export const QUESTION_TYPES = [
  'multiple_choice',
  'multiple_answer',
  'true_false',
  'predict_output',
  'code_fix',
  'open_ended',
  'code_exercise',
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

/** Types V1 grades deterministically; the rest are authored but unscored. */
export const GRADED_QUESTION_TYPES = [
  'multiple_choice',
  'multiple_answer',
  'true_false',
  'predict_output',
] as const satisfies readonly QuestionType[];

export type GradedQuestionType = (typeof GRADED_QUESTION_TYPES)[number];

export function isGradedQuestionType(type: QuestionType): type is GradedQuestionType {
  return (GRADED_QUESTION_TYPES as readonly QuestionType[]).includes(type);
}

export const PROGRESS_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const;
export type ProgressStatus = (typeof PROGRESS_STATUSES)[number];

export const LEARNING_MODES = [
  'LEARN',
  'PRACTICE',
  'REVIEW',
  'BOOST',
  'CHALLENGE',
  'INTERVIEW',
  'PROJECT',
] as const;
export type LearningMode = (typeof LEARNING_MODES)[number];

export const RECOMMENDATION_TYPES = [
  'NEXT_CHAPTER',
  'REVIEW',
  'EXERCISE',
  'QUIZ',
  'BOOST',
  'PROJECT',
] as const;
export type RecommendationType = (typeof RECOMMENDATION_TYPES)[number];

export const PRIORITY_BANDS = ['low', 'medium', 'high'] as const;
export type PriorityBand = (typeof PRIORITY_BANDS)[number];

/** Reasons an XP award exists. Part of the ledger's uniqueness key. */
export const XP_REASONS = [
  'CHAPTER_READ',
  'QUIZ_PASSED',
  'EXERCISE_COMPLETED',
  'CHAPTER_TEST_PASSED',
  'BOOST_COMPLETED',
  'PROJECT_COMPLETED',
  'SCORE_IMPROVED',
] as const;
export type XpReason = (typeof XP_REASONS)[number];

export type Percent = number; // 0..100, integer at rest
