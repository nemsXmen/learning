import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import {
  applyChapterCompletion,
  calculateMastery,
  scheduleNextReview,
  PARAMETERS,
  type SkillSnapshot,
} from '@app/learning-engine';
import { bundledGraph } from '@app/content';
import { AttemptAnswerEntity, QuizAttemptEntity } from '../quiz/quiz.entities';
import { BoostSessionEntity } from '../boost/boost.entities';
import { BOOST_PASS_PERCENT, boostScorePercent, boostSkillOutcomes } from '../boost/boost-outcomes';
import { MasteryChangeEntity, SkillMasteryEntity, UserProgressEntity } from './learning.entities';

/** One thing that happened, in the order it happened. */
interface ReplayEvent {
  at: Date;
  kind: 'ATTEMPT' | 'COMPLETION';
  sourceId: string;
  passed: boolean;
  outcomes: Array<{ skillId: string; correct: number; incorrect: number }>;
  /** For a completion: the skills the chapter teaches. */
  skillIds: string[];
}

export interface ReplayReport {
  userId: string;
  events: number;
  attempts: number;
  completions: number;
  skills: number;
  /** Skills the history mentions that content no longer declares. */
  orphanedSkills: string[];
}

/**
 * Rebuilds `skill_mastery` from the facts that produced it.
 *
 * This is what makes the rest of the design safe: the attempt is the fact,
 * mastery is derived, and a listener that failed — or a coefficient that changed
 * in `parameters.ts` — can be recovered by folding the history again
 * (features/10-skill-mastery-and-review/CONTRACT.md).
 *
 * It does NOT go through the event bus. Re-emitting would fire the streak with
 * historical dates and re-run achievement detection: replay rebuilds one derived
 * table, it does not re-live the past.
 */
@Injectable()
export class MasteryReplayService {
  private readonly logger = new Logger(MasteryReplayService.name);

  constructor(
    @InjectRepository(SkillMasteryEntity)
    private readonly mastery: Repository<SkillMasteryEntity>,
    @InjectRepository(MasteryChangeEntity)
    private readonly changes: Repository<MasteryChangeEntity>,
    @InjectRepository(UserProgressEntity)
    private readonly progress: Repository<UserProgressEntity>,
    @InjectRepository(QuizAttemptEntity)
    private readonly attempts: Repository<QuizAttemptEntity>,
    @InjectRepository(AttemptAnswerEntity)
    private readonly answers: Repository<AttemptAnswerEntity>,
    @InjectRepository(BoostSessionEntity)
    private readonly boosts: Repository<BoostSessionEntity>,
  ) {}

  async replay(userId: string): Promise<ReplayReport> {
    const events = await this.collect(userId);
    const declared = new Set(bundledGraph.skills.map((skill) => skill.id));

    const orphaned = new Set<string>();
    const snapshots = new Map<string, SkillSnapshot>();
    const audit: Array<Partial<MasteryChangeEntity>> = [];

    for (const event of events) {
      const touched =
        event.kind === 'ATTEMPT' ? event.outcomes.map((outcome) => outcome.skillId) : event.skillIds;

      for (const skillId of touched) {
        // Content is versioned in Git and may have dropped a skill since. Report
        // it rather than resurrecting a score for something that no longer exists.
        if (!declared.has(skillId)) {
          orphaned.add(skillId);
          continue;
        }

        const before = snapshots.get(skillId) ?? this.emptySnapshot(skillId);

        if (event.kind === 'COMPLETION') {
          const result = applyChapterCompletion(before, event.at);
          snapshots.set(skillId, {
            ...before,
            masteryScore: result.masteryScore,
            confidenceScore: result.confidenceScore,
            lastAttemptAt: event.at,
          });
          audit.push(this.change(userId, skillId, before, result, 'CHAPTER_COMPLETION', event));
          continue;
        }

        const outcome = event.outcomes.find((item) => item.skillId === skillId)!;
        const result = calculateMastery(before, outcome, event.at);
        const schedule = scheduleNextReview(
          { ...before, masteryScore: result.masteryScore },
          event.passed,
          event.at,
        );

        snapshots.set(skillId, {
          ...before,
          masteryScore: result.masteryScore,
          confidenceScore: result.confidenceScore,
          successCount: before.successCount + outcome.correct,
          failureCount: before.failureCount + outcome.incorrect,
          reviewCount: before.reviewCount + 1,
          intervalDays: schedule.intervalDays,
          lastAttemptAt: event.at,
          lastReviewedAt: event.at,
          nextReviewAt: schedule.nextReviewAt,
        });
        audit.push(this.change(userId, skillId, before, result, 'QUIZ_ATTEMPT', event));
      }
    }

    await this.persist(userId, snapshots, audit);

    const report: ReplayReport = {
      userId,
      events: events.length,
      attempts: events.filter((event) => event.kind === 'ATTEMPT').length,
      completions: events.filter((event) => event.kind === 'COMPLETION').length,
      skills: snapshots.size,
      orphanedSkills: [...orphaned],
    };

    if (orphaned.size > 0) {
      this.logger.warn(
        `Compétences absentes du contenu, ignorées : ${[...orphaned].join(', ')}`,
      );
    }

    return report;
  }

  /** Every learner who has any derived state or any history. */
  async replayAll(): Promise<ReplayReport[]> {
    const [withMastery, withAttempts, withProgress, withBoosts] = await Promise.all([
      this.mastery.find({ select: ['userId'] }),
      this.attempts.find({ select: ['userId'] }),
      this.progress.find({ select: ['userId'] }),
      this.boosts.find({ select: ['userId'] }),
    ]);

    const userIds = new Set([
      ...withMastery.map((row) => row.userId),
      ...withAttempts.map((row) => row.userId),
      ...withProgress.map((row) => row.userId),
      ...withBoosts.map((row) => row.userId),
    ]);

    const reports: ReplayReport[] = [];
    for (const userId of userIds) reports.push(await this.replay(userId));
    return reports;
  }

  /* ---------------------------------------------------------------------- */

  /**
   * Reconstructs the per-skill outcomes from the stored answers and the content,
   * exactly as grading did — the attempt rows are the facts, not a summary.
   */
  private async collect(userId: string): Promise<ReplayEvent[]> {
    const [attempts, completions, boosts] = await Promise.all([
      this.attempts.find({ where: { userId, submittedAt: Not(IsNull()) } }),
      this.progress.find({ where: { userId, status: 'COMPLETED' } }),
      this.boosts.find({ where: { userId, status: 'COMPLETED' } }),
    ]);

    const submitted = attempts.filter((attempt) => attempt.submittedAt !== null);
    const answers = submitted.length
      ? await this.answers.find({ where: { attemptId: In(submitted.map((a) => a.id)) } })
      : [];

    const answersByAttempt = new Map<string, AttemptAnswerEntity[]>();
    for (const answer of answers) {
      const bucket = answersByAttempt.get(answer.attemptId) ?? [];
      bucket.push(answer);
      answersByAttempt.set(answer.attemptId, bucket);
    }

    const skillsOfQuestion = this.questionSkills();
    const chaptersById = new Map(bundledGraph.chapters.map((chapter) => [chapter.id, chapter]));

    const events: ReplayEvent[] = [
      ...submitted.map((attempt) => {
        const tally = new Map<string, { skillId: string; correct: number; incorrect: number }>();

        for (const answer of answersByAttempt.get(attempt.id) ?? []) {
          for (const skillId of skillsOfQuestion.get(answer.questionId) ?? []) {
            const entry = tally.get(skillId) ?? { skillId, correct: 0, incorrect: 0 };
            if (answer.isCorrect) entry.correct += 1;
            else entry.incorrect += 1;
            tally.set(skillId, entry);
          }
        }

        return {
          at: attempt.submittedAt as Date,
          kind: 'ATTEMPT' as const,
          sourceId: attempt.id,
          passed: attempt.passed ?? false,
          outcomes: [...tally.values()],
          skillIds: [],
        };
      }),

      // A Boost session moves mastery exactly like a quiz attempt, and it is a
      // stored fact of its own: leaving it out made the replay rebuild learners
      // as if their revision sessions had never happened.
      ...boosts
        .filter((session) => session.completedAt !== null)
        .map((session) => ({
          at: session.completedAt as Date,
          kind: 'ATTEMPT' as const,
          // The same id the live path put on the event, so the audit matches.
          sourceId: `boost:${session.id}`,
          passed: boostScorePercent(session.plan, session.answers) >= BOOST_PASS_PERCENT,
          outcomes: boostSkillOutcomes(session.plan, session.answers),
          skillIds: [],
        })),

      ...completions
        .filter((row) => row.completedAt !== null)
        .map((row) => ({
          at: row.completedAt as Date,
          kind: 'COMPLETION' as const,
          sourceId: row.chapterId,
          passed: true,
          outcomes: [],
          skillIds: chaptersById.get(row.chapterId)?.skills ?? [],
        })),
    ];

    // Chronological, with a stable tie-break so two runs never disagree.
    return events.sort(
      (a, b) => a.at.getTime() - b.at.getTime() || a.sourceId.localeCompare(b.sourceId),
    );
  }

  private questionSkills(): Map<string, string[]> {
    const map = new Map<string, string[]>();
    for (const quiz of bundledGraph.quizzes) {
      for (const question of quiz.questions) map.set(question.id, question.skills);
    }
    return map;
  }

  private emptySnapshot(skillId: string): SkillSnapshot {
    const declared = bundledGraph.skills.find((skill) => skill.id === skillId);
    return {
      skillId,
      masteryScore: 0,
      confidenceScore: 0,
      successCount: 0,
      failureCount: 0,
      difficulty: 3,
      importance: (declared?.importance ?? 3) as SkillSnapshot['importance'],
      lastAttemptAt: null,
      lastReviewedAt: null,
      nextReviewAt: null,
      reviewCount: 0,
      intervalDays: 0,
    };
  }

  private change(
    userId: string,
    skillId: string,
    before: SkillSnapshot,
    result: { masteryScore: number; reason: string },
    sourceType: string,
    event: ReplayEvent,
  ): Partial<MasteryChangeEntity> {
    return {
      userId,
      skillId,
      fromScore: before.masteryScore,
      toScore: result.masteryScore,
      reason: result.reason,
      sourceType,
      sourceId: event.sourceId,
      occurredAt: event.at,
    };
  }

  /**
   * One transaction: a replay either replaces the derived state completely or
   * leaves the previous state untouched. Never half a rebuild.
   */
  private async persist(
    userId: string,
    snapshots: Map<string, SkillSnapshot>,
    audit: Array<Partial<MasteryChangeEntity>>,
  ): Promise<void> {
    await this.mastery.manager.transaction(async (tx) => {
      await tx.delete(SkillMasteryEntity, { userId });
      await tx.delete(MasteryChangeEntity, { userId });

      const rows = [...snapshots.values()].map((snapshot) => ({
        userId,
        skillId: snapshot.skillId,
        masteryScore: snapshot.masteryScore,
        confidenceScore: snapshot.confidenceScore,
        successCount: snapshot.successCount,
        failureCount: snapshot.failureCount,
        reviewCount: snapshot.reviewCount,
        intervalDays: snapshot.intervalDays,
        lastAttemptAt: snapshot.lastAttemptAt,
        lastReviewedAt: snapshot.lastReviewedAt,
        nextReviewAt:
          snapshot.masteryScore < PARAMETERS.mastery.masteredThreshold
            ? (snapshot.nextReviewAt ?? snapshot.lastAttemptAt)
            : snapshot.nextReviewAt,
      }));

      if (rows.length > 0) await tx.insert(SkillMasteryEntity, rows);
      if (audit.length > 0) await tx.insert(MasteryChangeEntity, audit);
    });
  }
}
