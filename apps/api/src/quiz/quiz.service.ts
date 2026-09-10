import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { bundledGraph, type QuizNode } from '@app/content';
import type { QuestionType } from '@app/types';
import { DomainEvents } from '../events/domain-events';
import { ChapterAccessService } from '../learning/chapter-access.service';
import {
  gradeAttempt,
  toQuestionPrompt,
  type AnswerInput,
  type QuestionResult,
  type SkillOutcome,
} from './grade';
import { AttemptAnswerEntity, QuizAttemptEntity, type AttemptSource } from './quiz.entities';

/** An attempt left open longer than this is stale; start a fresh one. */
export const ATTEMPT_TTL_MS = 6 * 3600 * 1000;

export interface StartedAttempt {
  attemptId: string;
  quizId: string;
  contentVersion: string;
  questions: ReturnType<typeof toQuestionPrompt>[];
}

export interface AttemptResult {
  attemptId: string;
  scorePercent: number;
  passed: boolean;
  results: QuestionResult[];
  skillOutcomes: SkillOutcome[];
  excludedTypes: QuestionType[];
}

export interface AttemptSummary {
  attemptId: string;
  scorePercent: number | null;
  passed: boolean | null;
  submittedAt: Date | null;
  startedAt: Date;
}

@Injectable()
export class QuizService {
  constructor(
    private readonly access: ChapterAccessService,
    private readonly events: DomainEvents,
    @InjectRepository(QuizAttemptEntity)
    private readonly attempts: Repository<QuizAttemptEntity>,
    @InjectRepository(AttemptAnswerEntity)
    private readonly answers: Repository<AttemptAnswerEntity>,
  ) {}

  /**
   * Starts an attempt and serves the questions without answers. The content
   * version is stamped now, so grading later uses what the learner actually saw.
   */
  async start(
    userId: string,
    quizId: string,
    source: AttemptSource = 'CHAPTER',
  ): Promise<StartedAttempt> {
    const quiz = this.requireQuiz(quizId);
    await this.access.requireUnlocked(userId, quiz.chapterId);

    const attempt = await this.attempts.save(
      this.attempts.create({
        userId,
        quizId,
        contentVersion: quiz.contentVersion,
        source,
        submittedAt: null,
        scorePercent: null,
        passed: null,
      }),
    );

    return {
      attemptId: attempt.id,
      quizId,
      contentVersion: quiz.contentVersion,
      questions: quiz.questions.map(toQuestionPrompt),
    };
  }

  async submit(userId: string, attemptId: string, answers: AnswerInput[]): Promise<AttemptResult> {
    const attempt = await this.attempts.findOne({ where: { id: attemptId } });

    // Someone else's attempt reads as absent: a 403 would confirm it exists.
    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException({
        code: 'ATTEMPT_NOT_FOUND',
        message: 'Tentative introuvable.',
      });
    }

    if (attempt.submittedAt !== null) {
      throw new ConflictException({
        code: 'ATTEMPT_ALREADY_SUBMITTED',
        message: 'Cette tentative a déjà été corrigée.',
      });
    }

    if (Date.now() - attempt.startedAt.getTime() > ATTEMPT_TTL_MS) {
      throw new GoneException({
        code: 'ATTEMPT_EXPIRED',
        message: 'Cette tentative a expiré. Recommence le quiz.',
      });
    }

    const quiz = this.requireQuiz(attempt.quizId);
    const known = new Set(quiz.questions.map((question) => question.id));
    const unknown = answers.find((answer) => !known.has(answer.questionId));
    if (unknown) {
      throw new BadRequestException({
        code: 'INVALID_ANSWER',
        message: `Question inconnue dans cette tentative : ${unknown.questionId}`,
      });
    }

    const graded = gradeAttempt(quiz.questions, answers);
    const submittedAt = new Date();

    // Conditional update: two submissions cannot both grade the same attempt.
    const claimed = await this.attempts
      .createQueryBuilder()
      .update(QuizAttemptEntity)
      .set({ submittedAt, scorePercent: graded.scorePercent, passed: graded.passed })
      .where('id = :id AND submitted_at IS NULL', { id: attemptId })
      .execute();

    if ((claimed.affected ?? 0) === 0) {
      throw new ConflictException({
        code: 'ATTEMPT_ALREADY_SUBMITTED',
        message: 'Cette tentative a déjà été corrigée.',
      });
    }

    const timeByQuestion = new Map(
      answers.map((answer) => [answer.questionId, answer.timeSpentMs ?? 0]),
    );
    // `given` is JSONB and may be null; TypeORM's partial-entity type rejects
    // null in an insert literal, so the rows are typed as entities.
    await this.answers.save(
      graded.results.map((result) => this.answers.create({
        attemptId,
        questionId: result.questionId,
        given: result.given,
        isCorrect: result.isCorrect,
        timeSpentMs: timeByQuestion.get(result.questionId) ?? 0,
      })),
    );

    // Mastery and XP are decided by their own slices, from this event.
    await this.events.emit('quiz.attempt.graded', {
      userId,
      attemptId,
      quizId: attempt.quizId,
      chapterId: quiz.chapterId,
      source: attempt.source,
      scorePercent: graded.scorePercent,
      passed: graded.passed,
      skillOutcomes: graded.skillOutcomes,
      occurredAt: submittedAt,
    });

    return { attemptId, ...graded };
  }

  /** History for one quiz, newest first. */
  async history(userId: string, quizId: string): Promise<AttemptSummary[]> {
    const rows = await this.attempts.find({
      where: { userId, quizId },
      order: { startedAt: 'DESC' },
      take: 50,
    });

    return rows.map((row) => ({
      attemptId: row.id,
      scorePercent: row.scorePercent,
      passed: row.passed,
      submittedAt: row.submittedAt,
      startedAt: row.startedAt,
    }));
  }

  /** The quiz attached to a chapter, addressed the way a URL is. */
  quizForChapter(technologySlug: string, chapterSlug: string): QuizNode {
    const chapter = bundledGraph.chapters.find(
      (item) => item.technology === technologySlug && item.slug === chapterSlug,
    );
    const quiz = chapter
      ? bundledGraph.quizzes.find((item) => item.chapterId === chapter.id)
      : undefined;

    if (!quiz) {
      throw new NotFoundException({
        code: 'CONTENT_NOT_FOUND',
        message: `Aucun quiz pour ${technologySlug}/${chapterSlug}`,
      });
    }
    return quiz;
  }

  private requireQuiz(quizId: string): QuizNode {
    const quiz = bundledGraph.quizzes.find((item) => item.id === quizId);
    if (!quiz) {
      throw new NotFoundException({ code: 'CONTENT_NOT_FOUND', message: `Quiz introuvable : ${quizId}` });
    }
    return quiz;
  }
}
