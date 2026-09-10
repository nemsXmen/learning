import type { Question } from '@app/validation';
import { gradeAttempt, gradeQuestion, PASS_THRESHOLD, toQuestionPrompt } from './grade';

function question(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    type: 'multiple_choice',
    difficulty: 2,
    question: 'Une question ?',
    options: ['A', 'B', 'C'],
    answer: [0],
    explanation: 'Parce que.',
    skills: ['closures'],
    ...overrides,
  } as Question;
}

/* -------------------------------------------------------------------------- */
/* Per question                                                                */
/* -------------------------------------------------------------------------- */

describe('gradeQuestion', () => {
  describe('multiple_choice', () => {
    it('accepts the right index and rejects a wrong one', () => {
      expect(gradeQuestion(question(), [0])).toBe(true);
      expect(gradeQuestion(question(), [1])).toBe(false);
    });

    it('rejects an extra index alongside the right one', () => {
      expect(gradeQuestion(question(), [0, 1])).toBe(false);
    });
  });

  describe('multiple_answer', () => {
    const multi = question({ type: 'multiple_answer', answer: [0, 2] });

    it('ignores the order the learner picked', () => {
      expect(gradeQuestion(multi, [2, 0])).toBe(true);
    });

    it('rejects a partial answer', () => {
      // Knowing half of it is not knowing it.
      expect(gradeQuestion(multi, [0])).toBe(false);
    });

    it('rejects a superset', () => {
      expect(gradeQuestion(multi, [0, 1, 2])).toBe(false);
    });

    it('ignores a duplicated index rather than failing on it', () => {
      expect(gradeQuestion(multi, [0, 2, 2])).toBe(true);
    });
  });

  describe('true_false', () => {
    const bool = question({ type: 'true_false', answer: true, options: undefined });

    it('compares booleans', () => {
      expect(gradeQuestion(bool, true)).toBe(true);
      expect(gradeQuestion(bool, false)).toBe(false);
    });

    it('refuses a string that looks like a boolean', () => {
      expect(gradeQuestion(bool, 'true')).toBe(false);
    });
  });

  describe('predict_output', () => {
    const output = question({ type: 'predict_output', answer: 'undefined', options: undefined });

    it('ignores surrounding whitespace and line endings', () => {
      expect(gradeQuestion(output, '  undefined \n')).toBe(true);
      expect(gradeQuestion(output, 'undefined\r\n')).toBe(true);
    });

    it('collapses runs of spaces but stays case-sensitive', () => {
      const spaced = question({ type: 'predict_output', answer: '1 2 3', options: undefined });
      expect(gradeQuestion(spaced, '1    2\t3')).toBe(true);
      expect(gradeQuestion(output, 'Undefined')).toBe(false);
    });
  });

  it('never marks an ungraded type correct', () => {
    const open = question({ type: 'open_ended', answer: undefined, options: undefined });
    expect(gradeQuestion(open, 'une très bonne réponse')).toBe(false);
  });

  it('treats an absent answer as wrong, not as skipped', () => {
    expect(gradeQuestion(question(), null)).toBe(false);
  });

  it('is wrong rather than throwing when the shape does not match the type', () => {
    expect(gradeQuestion(question(), true)).toBe(false);
    expect(gradeQuestion(question({ answer: undefined }), [0])).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Whole attempt                                                               */
/* -------------------------------------------------------------------------- */

describe('gradeAttempt', () => {
  const questions = [
    question({ id: 'q1', answer: [0], skills: ['closures'] }),
    question({ id: 'q2', answer: [1], skills: ['closures', 'scope'] }),
    question({ id: 'q3', type: 'true_false', answer: true, options: undefined, skills: ['scope'] }),
  ];

  it('scores over graded questions only', () => {
    const graded = gradeAttempt(questions, [
      { questionId: 'q1', given: [0] },
      { questionId: 'q2', given: [1] },
      { questionId: 'q3', given: false },
    ]);
    expect(graded.scorePercent).toBe(67);
    expect(graded.passed).toBe(true);
  });

  it('fails below the threshold', () => {
    const graded = gradeAttempt(questions, [{ questionId: 'q1', given: [0] }]);
    expect(graded.scorePercent).toBe(33);
    expect(graded.passed).toBe(false);
    expect(graded.scorePercent).toBeLessThan(PASS_THRESHOLD);
  });

  it('counts an unanswered question as wrong', () => {
    const graded = gradeAttempt(questions, []);
    expect(graded.scorePercent).toBe(0);
    expect(graded.results.every((result) => !result.isCorrect)).toBe(true);
  });

  it('returns the correct answer and the explanation for every graded question', () => {
    const graded = gradeAttempt(questions, [{ questionId: 'q1', given: [1] }]);
    const wrong = graded.results.find((result) => result.questionId === 'q1')!;

    // Given, correct, why, what to review — the four parts of CDC §76.
    expect(wrong.given).toEqual([1]);
    expect(wrong.correct).toEqual([0]);
    expect(wrong.explanation).toBe('Parce que.');
    expect(wrong.reviewSkills).toEqual(['closures']);
  });

  it('leaves reviewSkills empty when the answer was right', () => {
    const graded = gradeAttempt(questions, [{ questionId: 'q1', given: [0] }]);
    expect(graded.results.find((r) => r.questionId === 'q1')!.reviewSkills).toEqual([]);
  });

  it('tallies each skill across the questions that teach it', () => {
    const graded = gradeAttempt(questions, [
      { questionId: 'q1', given: [0] },
      { questionId: 'q2', given: [0] },
      { questionId: 'q3', given: true },
    ]);

    expect(graded.skillOutcomes).toContainEqual({ skillId: 'closures', correct: 1, incorrect: 1 });
    expect(graded.skillOutcomes).toContainEqual({ skillId: 'scope', correct: 1, incorrect: 1 });
  });

  it('excludes ungraded types from the score and reports them', () => {
    const withOpen = [
      question({ id: 'q1', answer: [0] }),
      question({ id: 'open', type: 'open_ended', answer: undefined, options: undefined }),
    ];
    const graded = gradeAttempt(withOpen, [
      { questionId: 'q1', given: [0] },
      { questionId: 'open', given: 'une réponse' },
    ]);

    // One graded question, all correct: the open one must not drag the score down.
    expect(graded.scorePercent).toBe(100);
    expect(graded.excludedTypes).toEqual(['open_ended']);
    expect(graded.results.find((r) => r.questionId === 'open')!.graded).toBe(false);
  });

  it('does not count an ungraded question towards any skill', () => {
    const withOpen = [
      question({ id: 'open', type: 'open_ended', answer: undefined, options: undefined, skills: ['scope'] }),
    ];
    expect(gradeAttempt(withOpen, [{ questionId: 'open', given: 'x' }]).skillOutcomes).toEqual([]);
  });

  it('scores zero and fails when nothing is gradable', () => {
    const onlyOpen = [question({ id: 'open', type: 'open_ended', answer: undefined, options: undefined })];
    const graded = gradeAttempt(onlyOpen, [{ questionId: 'open', given: 'x' }]);
    expect(graded.scorePercent).toBe(0);
    expect(graded.passed).toBe(false);
  });

  it('ignores an answer to a question that is not in the quiz', () => {
    const graded = gradeAttempt([question({ id: 'q1', answer: [0] })], [
      { questionId: 'q1', given: [0] },
      { questionId: 'fantome', given: [0] },
    ]);
    expect(graded.results).toHaveLength(1);
    expect(graded.scorePercent).toBe(100);
  });

  it('is deterministic', () => {
    const answers = [{ questionId: 'q1', given: [0] }];
    expect(gradeAttempt(questions, answers)).toEqual(gradeAttempt(questions, answers));
  });
});

/* -------------------------------------------------------------------------- */
/* What is served before answering                                             */
/* -------------------------------------------------------------------------- */

describe('toQuestionPrompt', () => {
  it('drops the answer and the explanation', () => {
    const prompt = toQuestionPrompt(question());
    const keys = Object.keys(prompt);

    expect(keys).not.toContain('answer');
    expect(keys).not.toContain('explanation');
    expect(JSON.stringify(prompt)).not.toContain('Parce que');
  });

  it('keeps what the learner needs to answer', () => {
    expect(toQuestionPrompt(question())).toMatchObject({
      id: 'q1',
      type: 'multiple_choice',
      options: ['A', 'B', 'C'],
      skills: ['closures'],
    });
  });

  it('omits options entirely when the type has none', () => {
    const prompt = toQuestionPrompt(
      question({ type: 'true_false', answer: true, options: undefined }),
    );
    expect('options' in prompt).toBe(false);
  });
});
