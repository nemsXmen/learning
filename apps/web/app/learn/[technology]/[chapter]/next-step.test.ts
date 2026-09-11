import { describe, expect, it } from 'vitest';
import { decideNextStep } from './next-step';
import type { AttemptSummary, ChapterProgress } from '../../../../lib/catalog';

const QUIZ = { id: 'javascript-variables-quiz', kind: 'QUIZ' as const, questionCount: 4 };
const CHAPTER = { slug: 'variables', quiz: QUIZ };
const NEXT = { slug: 'functions', title: 'Les fonctions', locked: false };

function attempt(partial: Partial<AttemptSummary>): AttemptSummary {
  return {
    attemptId: 'a',
    scorePercent: null,
    passed: null,
    submittedAt: '2026-09-10T10:00:00Z',
    startedAt: '2026-09-10T09:55:00Z',
    ...partial,
  };
}

function progress(status: ChapterProgress['status']): ChapterProgress {
  return {
    chapterId: 'javascript-variables',
    status,
    progressPercent: status === 'COMPLETED' ? 100 : 40,
    timeSpentSeconds: 120,
    completedAt: null,
  };
}

function decide(overrides: Partial<Parameters<typeof decideNextStep>[0]> = {}) {
  return decideNextStep({
    technologySlug: 'javascript',
    chapter: CHAPTER,
    progress: null,
    attempts: [],
    nextChapter: NEXT,
    ...overrides,
  });
}

describe('decideNextStep', () => {
  it('always offers the test, even mid-reading', () => {
    // The reason this module exists: the test was reachable by URL only.
    const step = decide({ progress: progress('IN_PROGRESS') });
    expect(step.action).toEqual({
      label: 'Passer le test',
      href: '/learn/javascript/variables/quiz',
    });
  });

  it('promotes the test once the chapter is read', () => {
    expect(decide({ progress: progress('COMPLETED') }).tone).toBe('primary');
    expect(decide({ progress: progress('IN_PROGRESS') }).tone).toBe('secondary');
  });

  it('announces how many questions, in the right number', () => {
    expect(decide().body).toContain('4 questions');
    expect(decide({ chapter: { slug: 'variables', quiz: { ...QUIZ, questionCount: 1 } } }).body)
      .toContain('1 question,');
  });

  it('shows the best score after a failed attempt and sends the learner back', () => {
    const step = decide({
      attempts: [attempt({ scorePercent: 25, passed: false }), attempt({ scorePercent: 50, passed: false })],
    });
    expect(step.bestScore).toBe(50);
    expect(step.attemptCount).toBe(2);
    expect(step.action?.href).toBe('/learn/javascript/variables/quiz');
    expect(step.tone).toBe('primary');
  });

  it('moves the learner on once the test is passed', () => {
    const step = decide({ attempts: [attempt({ scorePercent: 80, passed: true })] });
    expect(step.tone).toBe('done');
    expect(step.action).toEqual({ label: 'Chapitre suivant', href: '/learn/javascript/functions' });
    expect(step.bestScore).toBe(80);
  });

  it('explains the lock instead of offering a door that does not open', () => {
    const step = decide({
      attempts: [attempt({ scorePercent: 70, passed: true })],
      nextChapter: { ...NEXT, locked: true },
    });
    expect(step.body).toMatch(/débloquer/i);
    // Retaking is the only thing that moves mastery, so that is what is offered.
    expect(step.action).toEqual({ label: 'Refaire le test', href: '/learn/javascript/variables/quiz' });
  });

  it('ignores an attempt that was started but never submitted', () => {
    const step = decide({ attempts: [attempt({ submittedAt: null, scorePercent: null })] });
    expect(step.attemptCount).toBe(0);
    expect(step.bestScore).toBeNull();
    expect(step.action?.label).toBe('Passer le test');
  });

  it('still points somewhere when no test is written', () => {
    const step = decide({ chapter: { slug: 'variables', quiz: null } });
    expect(step.action).toEqual({ label: 'Chapitre suivant', href: '/learn/javascript/functions' });
    expect(step.title).toMatch(/pas encore de test/i);
  });

  it('says so plainly at the end of a module with no test', () => {
    const step = decide({ chapter: { slug: 'variables', quiz: null }, nextChapter: null });
    expect(step.action).toBeNull();
  });

  it('does not dead-end on the last chapter of a module', () => {
    const step = decide({ attempts: [attempt({ scorePercent: 90, passed: true })], nextChapter: null });
    expect(step.action).not.toBeNull();
    expect(step.body).toMatch(/dernier chapitre/i);
  });
});
