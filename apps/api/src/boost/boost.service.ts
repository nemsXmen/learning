import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  generateBoostSession,
  PARAMETERS,
  type BoostPlan,
  type QuestionRef,
  type SkillGraph,
} from '@app/learning-engine';
import { bundledGraph } from '@app/content';
import { DomainEvents } from '../events/domain-events';
import { MasteryService } from '../learning/mastery.service';
import { XpService } from '../gamification/xp.service';
import { gradeQuestion, type GivenAnswer } from '../quiz/grade';
import { BoostSessionEntity } from './boost.entities';
import { BOOST_PASS_PERCENT, boostScorePercent, boostSkillOutcomes } from './boost-outcomes';

export interface BoostPreview {
  available: boolean;
  targetSkills: Array<{ id: string; name: string; mastery: number; reason: string }>;
  suggestedMinutes: number;
  /** Present only when unavailable: a state to explain, not an error. */
  reason?: string;
}

export interface BoostStepView {
  index: number;
  kind: string;
  skillId: string;
  skillName: string;
  estimatedMinutes: number;
  /** The question to answer, without its answer key. */
  question: {
    id: string;
    type: string;
    difficulty: number;
    question: string;
    options?: string[];
  } | null;
}

export interface BoostSessionView {
  sessionId: string;
  status: string;
  targetSkillIds: string[];
  estimatedMinutes: number;
  reason: string;
  currentStepIndex: number;
  steps: BoostStepView[];
}

export interface BoostStepResult {
  index: number;
  isCorrect: boolean;
  correct?: GivenAnswer;
  explanation?: string;
  nextStepIndex: number | null;
}

export interface BoostCompletion {
  sessionId: string;
  scorePercent: number;
  masteryDeltas: Array<{ skillId: string; name: string; delta: number }>;
  xpAwarded: number;
}

const ALLOWED_MINUTES = [5, 10, 15];

@Injectable()
export class BoostService {
  constructor(
    private readonly mastery: MasteryService,
    private readonly xp: XpService,
    private readonly events: DomainEvents,
    @InjectRepository(BoostSessionEntity)
    private readonly sessions: Repository<BoostSessionEntity>,
  ) {}

  /** Nothing weak or due is a first-class state, never an error (CDC §81). */
  async preview(userId: string, now = new Date()): Promise<BoostPreview> {
    const weak = await this.mastery.weakSkills(userId, PARAMETERS.boost.maxTargetSkills, now);

    if (weak.length === 0) {
      return {
        available: false,
        targetSkills: [],
        suggestedMinutes: 0,
        reason: 'Rien à renforcer pour l’instant : aucune compétence n’est en retard.',
      };
    }

    const suggested = Math.min(
      PARAMETERS.boost.maxMinutes,
      Math.max(
        PARAMETERS.boost.minMinutes,
        weak.reduce((total, skill) => total + skill.estimatedMinutes, 0),
      ),
    );

    return {
      available: true,
      targetSkills: weak.map((skill) => ({
        id: skill.skillId,
        name: skill.name,
        mastery: skill.mastery,
        reason: skill.reason,
      })),
      suggestedMinutes: suggested,
    };
  }

  async create(userId: string, availableMinutes: number, now = new Date()): Promise<BoostSessionView> {
    if (!ALLOWED_MINUTES.includes(availableMinutes)) {
      throw new BadRequestException({
        code: 'INVALID_DURATION',
        message: `Durée invalide : choisis ${ALLOWED_MINUTES.join(', ')} minutes.`,
      });
    }

    const snapshots = await this.mastery.snapshotsFor(userId);
    const plan = generateBoostSession({
      skills: snapshots,
      graph: this.skillGraph(),
      availableMinutes,
      questionBank: this.questionBank(),
      now,
    });

    if (plan.steps.length === 0) {
      throw new NotFoundException({ code: 'NOTHING_TO_BOOST', message: plan.reason });
    }

    const session = await this.sessions.save(
      this.sessions.create({ userId, status: 'IN_PROGRESS', plan, answers: [] }),
    );

    return this.toView(session);
  }

  async get(userId: string, sessionId: string): Promise<BoostSessionView> {
    return this.toView(await this.requireSession(userId, sessionId));
  }

  /**
   * Answers one step. Steps run in order: skipping ahead would let a learner
   * collect the explanation before answering.
   */
  async answerStep(
    userId: string,
    sessionId: string,
    index: number,
    given: GivenAnswer,
  ): Promise<BoostStepResult> {
    const session = await this.requireSession(userId, sessionId);

    if (session.status !== 'IN_PROGRESS') {
      throw new ConflictException({
        code: 'SESSION_CLOSED',
        message: 'Cette session est terminée.',
      });
    }

    const expected = session.answers.length;
    if (index !== expected) {
      throw new ConflictException({
        code: 'STEP_OUT_OF_ORDER',
        message: `Étape attendue : ${expected}.`,
      });
    }

    const step = session.plan.steps[index];
    if (!step) {
      throw new NotFoundException({ code: 'STEP_NOT_FOUND', message: 'Étape inconnue.' });
    }

    const question = step.ref ? this.findQuestion(step.ref) : null;
    // An explanation step has nothing to grade; it still advances the session.
    const isCorrect = question ? gradeQuestion(question, given) : true;

    session.answers = [...session.answers, { index, correct: isCorrect }];
    await this.sessions.update({ id: session.id }, { answers: session.answers });

    const nextStepIndex = index + 1 < session.plan.steps.length ? index + 1 : null;

    return {
      index,
      isCorrect,
      ...(question
        ? { correct: (question.answer ?? null) as GivenAnswer, explanation: question.explanation }
        : {}),
      nextStepIndex,
    };
  }

  async complete(userId: string, sessionId: string, now = new Date()): Promise<BoostCompletion> {
    const session = await this.requireSession(userId, sessionId);

    if (session.status === 'COMPLETED') {
      return {
        sessionId,
        scorePercent: session.scorePercent ?? 0,
        masteryDeltas: session.masteryDelta ?? [],
        xpAwarded: 0,
      };
    }

    const scorePercent = boostScorePercent(session.plan, session.answers);

    // Mastery before, so the deltas shown are the ones this session produced.
    const before = await this.mastery.scoresFor(userId);

    await this.events.emit('quiz.attempt.graded', {
      userId,
      attemptId: `boost:${sessionId}`,
      quizId: `boost:${sessionId}`,
      chapterId: '',
      source: 'BOOST',
      scorePercent,
      passed: scorePercent >= BOOST_PASS_PERCENT,
      previousBestScore: null,
      skillOutcomes: boostSkillOutcomes(session.plan, session.answers),
      occurredAt: now,
    });

    const after = await this.mastery.scoresFor(userId);
    const names = new Map(bundledGraph.skills.map((skill) => [skill.id, skill.name]));
    const masteryDeltas = session.plan.targetSkillIds.map((skillId) => ({
      skillId,
      name: names.get(skillId) ?? skillId,
      delta: Math.round((after.get(skillId) ?? 0) - (before.get(skillId) ?? 0)),
    }));

    const xpAwarded = await this.xp.award({
      userId,
      reason: 'BOOST_COMPLETED',
      referenceType: 'boost',
      referenceId: sessionId,
      occurredAt: now,
    });

    await this.sessions.update(
      { id: sessionId },
      { status: 'COMPLETED', scorePercent, masteryDelta: masteryDeltas, completedAt: now },
    );

    return { sessionId, scorePercent, masteryDeltas, xpAwarded };
  }

  /* ---------------------------------------------------------------------- */

  private async requireSession(userId: string, sessionId: string): Promise<BoostSessionEntity> {
    const session = await this.sessions.findOne({ where: { id: sessionId } });
    // Someone else's session reads as absent, like an attempt.
    if (!session || session.userId !== userId) {
      throw new NotFoundException({ code: 'SESSION_NOT_FOUND', message: 'Session introuvable.' });
    }
    return session;
  }

  private toView(session: BoostSessionEntity): BoostSessionView {
    const names = new Map(bundledGraph.skills.map((skill) => [skill.id, skill.name]));

    return {
      sessionId: session.id,
      status: session.status,
      targetSkillIds: session.plan.targetSkillIds,
      estimatedMinutes: session.plan.estimatedMinutes,
      reason: session.plan.reason,
      currentStepIndex: session.answers.length,
      steps: session.plan.steps.map((step) => {
        const question = step.ref ? this.findQuestion(step.ref) : null;
        return {
          index: step.index,
          kind: step.kind,
          skillId: step.skillId,
          skillName: names.get(step.skillId) ?? step.skillId,
          estimatedMinutes: step.estimatedMinutes,
          question: question
            ? {
                id: question.id,
                type: question.type,
                difficulty: question.difficulty,
                question: question.question,
                ...(question.options ? { options: question.options } : {}),
              }
            : null,
        };
      }),
    };
  }

  private findQuestion(questionId: string) {
    for (const quiz of bundledGraph.quizzes) {
      const found = quiz.questions.find((question) => question.id === questionId);
      if (found) return found;
    }
    return null;
  }

  private skillGraph(): SkillGraph {
    return {
      requires: Object.fromEntries(bundledGraph.skills.map((skill) => [skill.id, skill.requires])),
    };
  }

  /** Every authored question, as refs the engine can plan with. */
  private questionBank(): QuestionRef[] {
    return bundledGraph.quizzes.flatMap((quiz) =>
      quiz.questions.flatMap((question) =>
        question.skills.map((skillId) => ({
          questionId: question.id,
          skillId,
          difficulty: question.difficulty as QuestionRef['difficulty'],
          estimatedMinutes: 1,
        })),
      ),
    );
  }
}

export type { BoostPlan };
