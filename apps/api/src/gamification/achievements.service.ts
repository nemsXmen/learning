import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PARAMETERS } from '@app/learning-engine';
import { DomainEvents } from '../events/domain-events';
import { SkillMasteryEntity, UserProgressEntity } from '../learning/learning.entities';
import { ACHIEVEMENTS, definitionOf, earnedAchievements, type AchievementDefinition } from './achievements';
import { StreakService } from './streak.service';
import { UserAchievementEntity } from './gamification.entities';
import { XpService } from './xp.service';

export interface AchievementView extends AchievementDefinition {
  unlockedAt: Date | null;
}

/**
 * Detection runs after XP is awarded and never affects it: the listener's errors
 * are swallowed by the bus, so a badge failing cannot undo a completed chapter.
 *
 * The pack asked for BullMQ here. It is synchronous instead, for the same reason
 * `MAIL_DRIVER` defaults to inline: a worker needs a process that stays alive,
 * and there is none on a serverless host (docs/decisions.md).
 */
@Injectable()
export class AchievementsService implements OnModuleInit {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    private readonly events: DomainEvents,
    private readonly xp: XpService,
    private readonly streaks: StreakService,
    @InjectRepository(UserAchievementEntity)
    private readonly unlocked: Repository<UserAchievementEntity>,
    @InjectRepository(SkillMasteryEntity)
    private readonly mastery: Repository<SkillMasteryEntity>,
    @InjectRepository(UserProgressEntity)
    private readonly progress: Repository<UserProgressEntity>,
  ) {}

  onModuleInit(): void {
    // Both signals matter. Listening to xp.awarded alone missed mastery badges:
    // a retake that earns nothing still moves mastery, and a learner could pass
    // the mastered threshold with no XP event to trigger detection.
    this.events.on('xp.awarded', async (payload) => {
      await this.detect(payload.userId, payload.occurredAt);
    });
    this.events.on('mastery.updated', async (payload) => {
      await this.detect(payload.userId, payload.occurredAt);
    });
  }

  async detect(userId: string, occurredAt: Date): Promise<string[]> {
    const [xp, streak, masteryRows, progressRows, already] = await Promise.all([
      this.xp.summary(userId, occurredAt),
      this.streaks.view(userId, occurredAt),
      this.mastery.find({ where: { userId } }),
      this.progress.find({ where: { userId, status: 'COMPLETED' } }),
      this.unlocked.find({ where: { userId } }),
    ]);

    const earned = earnedAchievements({
      xp,
      streak,
      masteredSkills: masteryRows.filter(
        (row) => row.masteryScore >= PARAMETERS.mastery.masteredThreshold,
      ).length,
      completedChapters: progressRows.length,
    });

    const known = new Set(already.map((row) => row.code));
    const fresh = earned.filter((code) => !known.has(code));
    if (fresh.length === 0) return [];

    // orIgnore: two concurrent detections must not fail on the primary key.
    await this.unlocked
      .createQueryBuilder()
      .insert()
      .values(fresh.map((code) => ({ userId, code })))
      .orIgnore()
      .execute();

    this.logger.log(`Succès débloqués : ${fresh.join(', ')}`);
    return fresh;
  }

  /** Every achievement, locked ones included: a locked badge is a goal. */
  async list(userId: string): Promise<AchievementView[]> {
    const rows = await this.unlocked.find({ where: { userId } });
    const byCode = new Map(rows.map((row) => [row.code, row.unlockedAt]));

    return ACHIEVEMENTS.map((achievement) => ({
      ...(definitionOf(achievement.code) ?? achievement),
      unlockedAt: byCode.get(achievement.code) ?? null,
    }));
  }
}
