import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { calculateXP, levelForXp, type LevelProgress } from '@app/learning-engine';
import type { XpReason } from '@app/types';
import {
  DomainEvents,
  type ChapterCompleted,
  type QuizAttemptGraded,
} from '../events/domain-events';
import { StreakService } from './streak.service';
import { XpTransactionEntity } from './gamification.entities';

export interface XpSummary extends LevelProgress {
  total: number;
  todayXp: number;
}

export interface XpEntry {
  amount: number;
  reason: XpReason;
  referenceType: string;
  referenceId: string;
  detail: string;
  createdAt: Date;
}

interface AwardInput {
  userId: string;
  reason: XpReason;
  referenceType: string;
  referenceId: string;
  occurredAt: Date;
  previousScore?: number;
  newScore?: number;
}

/** Postgres unique violation: the same effort was already paid. */
const UNIQUE_VIOLATION = '23505';

/**
 * The XP ledger (CDC §52). Nothing here holds a running total: the total is the
 * sum of the rows, so it cannot drift from its own history.
 */
@Injectable()
export class XpService implements OnModuleInit {
  private readonly logger = new Logger(XpService.name);

  constructor(
    private readonly events: DomainEvents,
    private readonly streaks: StreakService,
    @InjectRepository(XpTransactionEntity)
    private readonly ledger: Repository<XpTransactionEntity>,
  ) {}

  onModuleInit(): void {
    this.events.on('chapter.completed', (payload) => this.onChapterCompleted(payload));
    this.events.on('quiz.attempt.graded', (payload) => this.onAttemptGraded(payload));
  }

  async onChapterCompleted(payload: ChapterCompleted): Promise<void> {
    await this.award({
      userId: payload.userId,
      reason: 'CHAPTER_READ',
      referenceType: 'chapter',
      referenceId: payload.chapterId,
      occurredAt: payload.occurredAt,
    });
  }

  async onAttemptGraded(payload: QuizAttemptGraded): Promise<void> {
    if (!payload.passed) return;

    // A first pass pays the quiz; a later attempt only pays if it beat the best
    // score so far. Repeating the same result earns nothing (CDC §26).
    if (payload.previousBestScore === null) {
      await this.award({
        userId: payload.userId,
        reason: 'QUIZ_PASSED',
        referenceType: 'quiz',
        referenceId: payload.quizId,
        occurredAt: payload.occurredAt,
      });
      return;
    }

    await this.award({
      userId: payload.userId,
      reason: 'SCORE_IMPROVED',
      referenceType: 'quiz',
      // Keyed by attempt: each improvement is its own event.
      referenceId: payload.attemptId,
      occurredAt: payload.occurredAt,
      previousScore: payload.previousBestScore,
      newScore: payload.scorePercent,
    });
  }

  /**
   * Awards XP once. The engine decides the amount; the unique constraint decides
   * whether it is the first time (CDC §26).
   */
  async award(input: AwardInput): Promise<number> {
    const alreadyRewarded = await this.hasBeenRewarded(input);
    const { amount, reason } = calculateXP({
      reason: input.reason,
      alreadyRewarded,
      ...(input.previousScore === undefined ? {} : { previousScore: input.previousScore }),
      ...(input.newScore === undefined ? {} : { newScore: input.newScore }),
    });

    if (amount <= 0) return 0;

    try {
      await this.ledger.insert({
        userId: input.userId,
        amount,
        reason: input.reason,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        detail: reason,
      });
    } catch (error) {
      if ((error as { code?: string }).code === UNIQUE_VIOLATION) return 0;
      throw error;
    }

    // Earning XP is what counts as activity for the streak: reading a page does
    // not (CDC §26, and the open question closed in docs/decisions.md).
    await this.streaks.recordActivity(input.userId, input.occurredAt);

    await this.events.emit('xp.awarded', {
      userId: input.userId,
      amount,
      reason: input.reason,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      detail: reason,
      occurredAt: input.occurredAt,
    });

    return amount;
  }

  async summary(userId: string, now = new Date()): Promise<XpSummary> {
    const rows = await this.ledger.find({ where: { userId } });
    const total = rows.reduce((sum, row) => sum + row.amount, 0);

    const today = now.toISOString().slice(0, 10);
    const todayXp = rows
      .filter((row) => row.createdAt.toISOString().slice(0, 10) === today)
      .reduce((sum, row) => sum + row.amount, 0);

    return { total, todayXp, ...levelForXp(total) };
  }

  async history(userId: string, limit = 50): Promise<XpEntry[]> {
    const rows = await this.ledger.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: Math.min(200, Math.max(1, limit)),
    });

    return rows.map((row) => ({
      amount: row.amount,
      reason: row.reason,
      referenceType: row.referenceType,
      referenceId: row.referenceId,
      detail: row.detail,
      createdAt: row.createdAt,
    }));
  }

  private async hasBeenRewarded(input: AwardInput): Promise<boolean> {
    const existing = await this.ledger.findOne({
      where: {
        userId: input.userId,
        reason: input.reason,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
      },
    });
    return existing !== null;
  }

}
