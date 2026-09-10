import { isGradedQuestionType, type QuestionType } from '@app/types';
import type { Question } from '@app/validation';

/**
 * Grading, as a pure function.
 *
 * Kept free of Nest and TypeORM so every rule can be tested directly — this is
 * the code that tells a learner they are wrong, so it had better be right.
 */

/** A score at or above this passes the quiz. */
export const PASS_THRESHOLD = 60;

export type GivenAnswer = number[] | boolean | string | null;

export interface AnswerInput {
  questionId: string;
  given: GivenAnswer;
  timeSpentMs?: number;
}

export interface QuestionResult {
  questionId: string;
  type: QuestionType;
  graded: boolean;
  isCorrect: boolean;
  given: GivenAnswer;
  /** Only present once the question has been answered — never served beforehand. */
  correct?: GivenAnswer;
  explanation?: string;
  reviewSkills: string[];
}

export interface SkillOutcome {
  skillId: string;
  correct: number;
  incorrect: number;
}

export interface GradedAttempt {
  scorePercent: number;
  passed: boolean;
  results: QuestionResult[];
  skillOutcomes: SkillOutcome[];
  /** Question types present but not scored, so the UI can say so rather than hide them. */
  excludedTypes: QuestionType[];
}

/** Output comparison ignores surrounding space and line-ending differences. */
function normaliseOutput(value: string): string {
  return value.replace(/\r\n/g, '\n').trim().replace(/[ \t]+/g, ' ');
}

/**
 * Set comparison, so a repeated index is the same selection rather than a wrong
 * one — a checkbox cannot produce one, but a hand-made request can.
 */
function sameIndexSet(given: number[], expected: number[]): boolean {
  const a = [...new Set(given)].sort((x, y) => x - y);
  const b = [...new Set(expected)].sort((x, y) => x - y);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * One question. An absent answer is wrong, never skipped: a learner who runs out
 * of time did not half-know it.
 */
export function gradeQuestion(question: Question, given: GivenAnswer): boolean {
  if (!isGradedQuestionType(question.type)) return false;
  if (given === null || given === undefined) return false;

  const expected = question.answer;
  if (expected === undefined) return false;

  switch (question.type) {
    case 'true_false':
      return typeof given === 'boolean' && given === expected;

    case 'predict_output':
      return (
        typeof given === 'string' &&
        typeof expected === 'string' &&
        normaliseOutput(given) === normaliseOutput(expected)
      );

    case 'multiple_choice':
    case 'multiple_answer':
      return (
        Array.isArray(given) &&
        Array.isArray(expected) &&
        sameIndexSet(given as number[], expected as number[])
      );

    default:
      return false;
  }
}

export function gradeAttempt(questions: Question[], answers: AnswerInput[]): GradedAttempt {
  const byQuestion = new Map(answers.map((answer) => [answer.questionId, answer]));
  const skillTally = new Map<string, SkillOutcome>();
  const excluded = new Set<QuestionType>();

  const results: QuestionResult[] = questions.map((question) => {
    const given = byQuestion.get(question.id)?.given ?? null;
    const graded = isGradedQuestionType(question.type);
    if (!graded) excluded.add(question.type);

    const isCorrect = graded && gradeQuestion(question, given);

    if (graded) {
      for (const skillId of question.skills) {
        const tally = skillTally.get(skillId) ?? { skillId, correct: 0, incorrect: 0 };
        if (isCorrect) tally.correct += 1;
        else tally.incorrect += 1;
        skillTally.set(skillId, tally);
      }
    }

    return {
      questionId: question.id,
      type: question.type,
      graded,
      isCorrect,
      given,
      // Never a bare "Incorrect": the answer and the why travel together (CDC §76).
      ...(graded ? { correct: (question.answer ?? null) as GivenAnswer } : {}),
      explanation: question.explanation,
      reviewSkills: isCorrect ? [] : question.skills,
    };
  });

  const gradedResults = results.filter((result) => result.graded);
  const scorePercent =
    gradedResults.length === 0
      ? 0
      : Math.round(
          (gradedResults.filter((result) => result.isCorrect).length / gradedResults.length) * 100,
        );

  return {
    scorePercent,
    passed: gradedResults.length > 0 && scorePercent >= PASS_THRESHOLD,
    results,
    skillOutcomes: [...skillTally.values()],
    excludedTypes: [...excluded],
  };
}

/** The shape served when an attempt starts: no answer, no explanation. */
export function toQuestionPrompt(question: Question): {
  id: string;
  type: QuestionType;
  difficulty: number;
  question: string;
  options?: string[];
  skills: string[];
} {
  return {
    id: question.id,
    type: question.type,
    difficulty: question.difficulty,
    question: question.question,
    ...(question.options ? { options: question.options } : {}),
    skills: question.skills,
  };
}
