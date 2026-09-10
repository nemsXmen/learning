import { Injectable, Logger, NotFoundException, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  applyChapterCompletion,
  calculateMastery,
  calculateReviewPriority,
  detectWeakSkills,
  isDue,
  scheduleNextReview,
  PARAMETERS,
  type SkillGraph,
  type SkillSnapshot,
} from '@app/learning-engine';
import { bundledGraph } from '@app/content';
import { DomainEvents, type ChapterCompleted, type QuizAttemptGraded } from '../events/domain-events';
import { MasteryChangeEntity, SkillMasteryEntity } from './learning.entities';

export interface MasteryView {
  skillId: string;
  name: string;
  mastery: number;
  confidence: number;
  nextReviewAt: Date | null;
  dueNow: boolean;
}

export interface WeakSkillView extends MasteryView {
  band: 'low' | 'medium' | 'high';
  priority: number;
  reason: string;
  estimatedMinutes: number;
}

export interface TechnologyMastery {
  technologySlug: string;
  averageMastery: number;
  skills: MasteryView[];
}

/** Reading a chapter is evidence, but weaker than answering questions about it. */
const SOURCE_CHAPTER = 'CHAPTER_COMPLETION';
const SOURCE_ATTEMPT = 'QUIZ_ATTEMPT';

/**
 * Wires the pure engine to persistence. Every number comes from
 * `@app/learning-engine`; this module decides nothing (docs/rules.md #7).
 */
@Injectable()
export class MasteryService implements OnModuleInit {
  private readonly logger = new Logger(MasteryService.name);

  constructor(
    private readonly events: DomainEvents,
    @InjectRepository(SkillMasteryEntity)
    private readonly mastery: Repository<SkillMasteryEntity>,
    @InjectRepository(MasteryChangeEntity)
    private readonly changes: Repository<MasteryChangeEntity>,
  ) {}

  /**
   * Listeners run inside the request that graded the attempt, so a learner sees
   * their new mastery immediately. They are not in the same database
   * transaction: the attempt is the fact, mastery is derived from it and can be
   * rebuilt with `mastery:replay` if a listener ever fails.
   */
  onModuleInit(): void {
    this.events.on('quiz.attempt.graded', (payload) => this.onAttemptGraded(payload));
    this.events.on('chapter.completed', (payload) => this.onChapterCompleted(payload));
  }

  async onAttemptGraded(payload: QuizAttemptGraded): Promise<void> {
    const changes: Array<{ skillId: string; from: number; to: number; reason: string }> = [];

    for (const outcome of payload.skillOutcomes) {
      const snapshot = await this.snapshotOf(payload.userId, outcome.skillId);

      const result = calculateMastery(
        snapshot,
        { skillId: outcome.skillId, correct: outcome.correct, incorrect: outcome.incorrect },
        payload.occurredAt,
      );
      const schedule = scheduleNextReview(
        { ...snapshot, masteryScore: result.masteryScore },
        payload.passed,
        payload.occurredAt,
      );

      await this.persist(payload.userId, outcome.skillId, snapshot, result, {
        successes: outcome.correct,
        failures: outcome.incorrect,
        reviewed: true,
        intervalDays: schedule.intervalDays,
        nextReviewAt: schedule.nextReviewAt,
        now: payload.occurredAt,
        sourceType: SOURCE_ATTEMPT,
        sourceId: payload.attemptId,
      });

      changes.push({
        skillId: outcome.skillId,
        from: snapshot.masteryScore,
        to: result.masteryScore,
        reason: result.reason,
      });
    }

    if (changes.length > 0) {
      await this.events.emit('mastery.updated', {
        userId: payload.userId,
        changes,
        occurredAt: payload.occurredAt,
      });
    }
  }

  async onChapterCompleted(payload: ChapterCompleted): Promise<void> {
    const changes: Array<{ skillId: string; from: number; to: number; reason: string }> = [];

    for (const skillId of payload.skillIds) {
      const snapshot = await this.snapshotOf(payload.userId, skillId);
      const result = applyChapterCompletion(snapshot, payload.occurredAt);

      await this.persist(payload.userId, skillId, snapshot, result, {
        successes: 0,
        failures: 0,
        reviewed: false,
        intervalDays: snapshot.intervalDays,
        nextReviewAt: snapshot.nextReviewAt,
        now: payload.occurredAt,
        sourceType: SOURCE_CHAPTER,
        sourceId: payload.chapterId,
      });

      changes.push({
        skillId,
        from: snapshot.masteryScore,
        to: result.masteryScore,
        reason: result.reason,
      });
    }

    if (changes.length > 0) {
      await this.events.emit('mastery.updated', {
        userId: payload.userId,
        changes,
        occurredAt: payload.occurredAt,
      });
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Reads                                                                   */
  /* ---------------------------------------------------------------------- */

  async byTechnology(userId: string, technologySlug: string, now = new Date()): Promise<TechnologyMastery> {
    const skills = bundledGraph.skills.filter((skill) => skill.technology === technologySlug);
    if (skills.length === 0) {
      throw new NotFoundException({
        code: 'TECHNOLOGY_NOT_FOUND',
        message: `Technologie introuvable : ${technologySlug}`,
      });
    }

    const rows = await this.rowsOf(userId);
    const views = skills.map((skill) => this.toView(skill.id, skill.name, rows.get(skill.id), now));

    return {
      technologySlug,
      averageMastery: Math.round(
        views.reduce((total, view) => total + view.mastery, 0) / views.length,
      ),
      skills: views,
    };
  }

  /** The skills that need attention, ordered by the engine, each with its reason. */
  async weakSkills(userId: string, limit = 3, now = new Date()): Promise<WeakSkillView[]> {
    const rows = await this.rowsOf(userId);
    const snapshots = bundledGraph.skills.map((skill) => this.snapshotFrom(skill.id, rows.get(skill.id)));
    const names = new Map(bundledGraph.skills.map((skill) => [skill.id, skill.name]));

    return detectWeakSkills(snapshots, this.skillGraph(), now, limit).map((priority) => {
      const view = this.toView(priority.skillId, names.get(priority.skillId) ?? priority.skillId, rows.get(priority.skillId), now);
      return {
        ...view,
        band: priority.band,
        priority: priority.priority,
        reason: priority.reason,
        estimatedMinutes: priority.estimatedMinutes,
      };
    });
  }

  async dueReviews(userId: string, now = new Date()): Promise<WeakSkillView[]> {
    const rows = await this.rowsOf(userId);
    const names = new Map(bundledGraph.skills.map((skill) => [skill.id, skill.name]));
    const graph = this.skillGraph();

    return [...rows.values()]
      .map((row) => this.snapshotFrom(row.skillId, row))
      .filter((snapshot) => isDue(snapshot, now))
      .map((snapshot) => {
        const priority = calculateReviewPriority(snapshot, graph, now);
        const view = this.toView(snapshot.skillId, names.get(snapshot.skillId) ?? snapshot.skillId, rows.get(snapshot.skillId), now);
        return {
          ...view,
          band: priority.band,
          priority: priority.priority,
          reason: priority.reason,
          estimatedMinutes: priority.estimatedMinutes,
        };
      })
      .sort((a, b) => b.priority - a.priority || a.skillId.localeCompare(b.skillId));
  }

  /** Engine-shaped snapshots for every declared skill. Used to plan a Boost. */
  async snapshotsFor(userId: string): Promise<SkillSnapshot[]> {
    const rows = await this.rowsOf(userId);
    return bundledGraph.skills.map((skill) => this.snapshotFrom(skill.id, rows.get(skill.id)));
  }

  /** Current scores by skill, for measuring what a session actually moved. */
  async scoresFor(userId: string): Promise<Map<string, number>> {
    const rows = await this.rowsOf(userId);
    return new Map([...rows.values()].map((row) => [row.skillId, row.masteryScore]));
  }

  /* ---------------------------------------------------------------------- */
  /* Internals                                                               */
  /* ---------------------------------------------------------------------- */

  private skillGraph(): SkillGraph {
    return {
      requires: Object.fromEntries(bundledGraph.skills.map((skill) => [skill.id, skill.requires])),
    };
  }

  private async rowsOf(userId: string): Promise<Map<string, SkillMasteryEntity>> {
    const rows = await this.mastery.find({ where: { userId } });
    return new Map(rows.map((row) => [row.skillId, row]));
  }

  private async snapshotOf(userId: string, skillId: string): Promise<SkillSnapshot> {
    const row = await this.mastery.findOne({ where: { userId, skillId } });
    return this.snapshotFrom(skillId, row ?? undefined);
  }

  private snapshotFrom(skillId: string, row: SkillMasteryEntity | undefined): SkillSnapshot {
    const declared = bundledGraph.skills.find((skill) => skill.id === skillId);

    return {
      skillId,
      masteryScore: row?.masteryScore ?? 0,
      confidenceScore: row?.confidenceScore ?? 0,
      successCount: row?.successCount ?? 0,
      failureCount: row?.failureCount ?? 0,
      // Difficulty is not tracked per learner yet; importance comes from content.
      difficulty: 3,
      importance: (declared?.importance ?? 3) as SkillSnapshot['importance'],
      lastAttemptAt: row?.lastAttemptAt ?? null,
      lastReviewedAt: row?.lastReviewedAt ?? null,
      nextReviewAt: row?.nextReviewAt ?? null,
      reviewCount: row?.reviewCount ?? 0,
      intervalDays: row?.intervalDays ?? 0,
    };
  }

  private toView(
    skillId: string,
    name: string,
    row: SkillMasteryEntity | undefined,
    now: Date,
  ): MasteryView {
    const snapshot = this.snapshotFrom(skillId, row);
    return {
      skillId,
      name,
      mastery: Math.round(snapshot.masteryScore),
      confidence: Math.round(snapshot.confidenceScore),
      nextReviewAt: snapshot.nextReviewAt,
      dueNow: isDue(snapshot, now),
    };
  }

  private async persist(
    userId: string,
    skillId: string,
    snapshot: SkillSnapshot,
    result: { masteryScore: number; confidenceScore: number; reason: string },
    context: {
      successes: number;
      failures: number;
      reviewed: boolean;
      intervalDays: number;
      nextReviewAt: Date | null;
      now: Date;
      sourceType: string;
      sourceId: string;
    },
  ): Promise<void> {
    await this.mastery.upsert(
      {
        userId,
        skillId,
        masteryScore: result.masteryScore,
        confidenceScore: result.confidenceScore,
        successCount: snapshot.successCount + context.successes,
        failureCount: snapshot.failureCount + context.failures,
        reviewCount: snapshot.reviewCount + (context.reviewed ? 1 : 0),
        intervalDays: context.intervalDays,
        lastAttemptAt: context.now,
        lastReviewedAt: context.reviewed ? context.now : snapshot.lastReviewedAt,
        // Always scheduled while below mastery: nothing weak is left unplanned.
        nextReviewAt:
          result.masteryScore < PARAMETERS.mastery.masteredThreshold
            ? (context.nextReviewAt ?? context.now)
            : context.nextReviewAt,
      },
      ['userId', 'skillId'],
    );

    // The reason is stored, not just returned: a mastery move stays explainable.
    await this.changes.insert({
      userId,
      skillId,
      fromScore: snapshot.masteryScore,
      toScore: result.masteryScore,
      reason: result.reason,
      sourceType: context.sourceType,
      sourceId: context.sourceId,
      occurredAt: context.now,
    });
  }
}
