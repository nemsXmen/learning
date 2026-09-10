import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import type { ProgressStatus } from '@app/types';
import { ContentService } from '../content/content.service';
import { prerequisiteSkillsOf, resolveLock } from '../catalog/catalog.view';
import { DomainEvents } from '../events/domain-events';
import { REDIS } from '../redis/redis.tokens';
import { SkillMasteryEntity, UserProgressEntity } from './learning.entities';

/** A single report cannot claim more than a few minutes of reading. */
export const MAX_REPORT_SECONDS = 300;
/** Nor can a learner accumulate more than this in one day, across everything. */
export const MAX_DAILY_SECONDS = 8 * 3600;

export interface ProgressView {
  chapterId: string;
  status: ProgressStatus;
  progressPercent: number;
  timeSpentSeconds: number;
  lastAccessedAt: Date | null;
  completedAt: Date | null;
}

export interface CompletionResult {
  chapterId: string;
  status: 'COMPLETED';
  completedAt: Date;
  alreadyCompleted: boolean;
}

export interface TechnologyProgress {
  technologySlug: string;
  progressPercent: number;
  chapters: Array<Pick<ProgressView, 'chapterId' | 'status' | 'progressPercent' | 'completedAt'>>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Owns `user_progress` (docs/data-model.md). Records facts; it awards nothing —
 * XP is slice 11's decision, mastery is slice 10's.
 */
@Injectable()
export class ProgressService {
  constructor(
    private readonly content: ContentService,
    private readonly events: DomainEvents,
    @Inject(REDIS) private readonly redis: Redis,
    @InjectRepository(UserProgressEntity)
    private readonly progress: Repository<UserProgressEntity>,
    @InjectRepository(SkillMasteryEntity)
    private readonly mastery: Repository<SkillMasteryEntity>,
  ) {}

  async report(
    userId: string,
    chapterId: string,
    input: { progressPercent?: number; timeSpentSeconds?: number },
    now = new Date(),
  ): Promise<ProgressView> {
    await this.requireUnlockedChapter(userId, chapterId);
    const existing = await this.progress.findOne({ where: { userId, chapterId } });

    const grantedSeconds = await this.grantTime(userId, input.timeSpentSeconds ?? 0, now);

    // Monotonic: a scroll report from a stale tab must never rewind progress.
    const reported = clamp(Math.round(input.progressPercent ?? 0), 0, 100);
    const progressPercent = Math.max(existing?.progressPercent ?? 0, reported);

    const status: ProgressStatus =
      existing?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';

    const row: UserProgressEntity = {
      ...(existing ?? {
        userId,
        chapterId,
        timeSpentSeconds: 0,
        completedAt: null,
        updatedAt: now,
      }),
      status,
      progressPercent,
      timeSpentSeconds: (existing?.timeSpentSeconds ?? 0) + grantedSeconds,
      lastAccessedAt: now,
    } as UserProgressEntity;

    await this.progress.upsert(row, ['userId', 'chapterId']);

    await this.events.emit('progress.reported', {
      userId,
      chapterId,
      status,
      progressPercent,
      occurredAt: now,
    });

    return this.toView({ ...row, chapterId, userId });
  }

  /**
   * Completing twice is a no-op. The conditional UPDATE is the guard: two
   * concurrent requests cannot both see `affected === 1`, so the event fires once.
   */
  async complete(userId: string, chapterId: string, now = new Date()): Promise<CompletionResult> {
    const chapter = await this.requireUnlockedChapter(userId, chapterId);

    const claimed = await this.progress
      .createQueryBuilder()
      .update(UserProgressEntity)
      .set({ status: 'COMPLETED', progressPercent: 100, completedAt: now, lastAccessedAt: now })
      .where('user_id = :userId AND chapter_id = :chapterId AND status <> :completed', {
        userId,
        chapterId,
        completed: 'COMPLETED',
      })
      .execute();

    if ((claimed.affected ?? 0) === 0) {
      const existing = await this.progress.findOne({ where: { userId, chapterId } });
      if (existing?.status === 'COMPLETED') {
        return {
          chapterId,
          status: 'COMPLETED',
          completedAt: existing.completedAt ?? now,
          alreadyCompleted: true,
        };
      }

      // No row yet: insert it already completed.
      await this.progress.insert({
        userId,
        chapterId,
        status: 'COMPLETED',
        progressPercent: 100,
        timeSpentSeconds: existing?.timeSpentSeconds ?? 0,
        completedAt: now,
        lastAccessedAt: now,
      });
    }

    await this.events.emit('chapter.completed', {
      userId,
      chapterId,
      technologySlug: chapter.technology,
      skillIds: chapter.skills,
      xp: chapter.xp,
      occurredAt: now,
    });

    return { chapterId, status: 'COMPLETED', completedAt: now, alreadyCompleted: false };
  }

  async getChapter(userId: string, chapterId: string): Promise<ProgressView> {
    const row = await this.progress.findOne({ where: { userId, chapterId } });
    if (row) return this.toView(row);

    // An absent row is "not started", not an error.
    return {
      chapterId,
      status: 'NOT_STARTED',
      progressPercent: 0,
      timeSpentSeconds: 0,
      lastAccessedAt: null,
      completedAt: null,
    };
  }

  async getTechnology(userId: string, technologySlug: string): Promise<TechnologyProgress> {
    const graph = this.content.getGraph();
    if (!graph.technologies.some((item) => item.slug === technologySlug)) {
      throw new NotFoundException({
        code: 'TECHNOLOGY_NOT_FOUND',
        message: `Technologie introuvable : ${technologySlug}`,
      });
    }

    const chapterIds = graph.chapters
      .filter((chapter) => chapter.technology === technologySlug)
      .map((chapter) => chapter.id);

    const rows = await this.progress.find({ where: { userId } });
    const byChapter = new Map(rows.map((row) => [row.chapterId, row]));

    const chapters = chapterIds.map((chapterId) => {
      const row = byChapter.get(chapterId);
      return {
        chapterId,
        status: row?.status ?? ('NOT_STARTED' as ProgressStatus),
        progressPercent: row?.progressPercent ?? 0,
        completedAt: row?.completedAt ?? null,
      };
    });

    const progressPercent =
      chapters.length === 0
        ? 0
        : Math.round(
            chapters.reduce((total, chapter) => total + chapter.progressPercent, 0) /
              chapters.length,
          );

    return { technologySlug, progressPercent, chapters };
  }

  /**
   * Time is granted, not accepted: an idle tab reporting all night must not turn
   * into eight hours of study. Capped per report and per local day.
   */
  private async grantTime(userId: string, requested: number, now: Date): Promise<number> {
    const perReport = clamp(Math.round(requested), 0, MAX_REPORT_SECONDS);
    if (perReport === 0) return 0;

    const key = `progress:time:${userId}:${now.toISOString().slice(0, 10)}`;
    try {
      const used = Number((await this.redis.get(key)) ?? 0);
      const granted = clamp(perReport, 0, Math.max(0, MAX_DAILY_SECONDS - used));
      if (granted > 0) {
        await this.redis.incrby(key, granted);
        await this.redis.expire(key, 2 * 24 * 3600);
      }
      return granted;
    } catch {
      // Redis down: fall back to the per-report cap rather than refusing progress.
      return perReport;
    }
  }

  private async requireUnlockedChapter(userId: string, chapterId: string) {
    const chapter = this.content.getGraph().chapters.find((item) => item.id === chapterId);
    if (!chapter) {
      throw new NotFoundException({
        code: 'CHAPTER_NOT_FOUND',
        message: `Chapitre introuvable : ${chapterId}`,
      });
    }

    const prerequisites = prerequisiteSkillsOf(this.content.getGraph(), chapterId);
    if (prerequisites.length > 0) {
      const rows = await this.mastery.find({ where: { userId } });
      const scores = new Map(rows.map((row) => [row.skillId, row.masteryScore]));
      const names = new Map(this.content.getGraph().skills.map((s) => [s.id, s.name]));
      const lock = resolveLock(prerequisites, scores, names);

      if (lock.locked) {
        throw new ForbiddenException({
          code: 'CHAPTER_LOCKED',
          message: 'Ce chapitre est encore verrouillé.',
          lockReason: lock.lockReason,
        });
      }
    }

    return chapter;
  }

  private toView(row: UserProgressEntity): ProgressView {
    return {
      chapterId: row.chapterId,
      status: row.status,
      progressPercent: row.progressPercent,
      timeSpentSeconds: row.timeSpentSeconds,
      lastAccessedAt: row.lastAccessedAt,
      completedAt: row.completedAt,
    };
  }
}
