import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isStreakAtRisk, updateStreak, type StreakState } from '@app/learning-engine';
import { UserEntity } from '../auth/auth.entities';
import { StreakEntity } from './gamification.entities';

export interface StreakView extends StreakState {
  activeToday: boolean;
  atRisk: boolean;
  timezone: string;
}

/**
 * The streak, in the learner's own calendar day (CDC §16, §25). The engine owns
 * the rule; this service owns the row.
 */
@Injectable()
export class StreakService {
  constructor(
    @InjectRepository(StreakEntity)
    private readonly streaks: Repository<StreakEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  /** Called when XP is earned: that is what counts as activity, not a page view. */
  async recordActivity(userId: string, at: Date): Promise<StreakView> {
    const timezone = await this.timezoneOf(userId);
    const current = await this.stateOf(userId);
    const result = updateStreak(current, at, timezone);

    if (result.changed) {
      await this.streaks.upsert(
        {
          userId,
          currentDays: result.currentDays,
          longestDays: result.longestDays,
          lastActiveDate: result.lastActiveDate,
        },
        ['userId'],
      );
    }

    return this.toView(result, at, timezone);
  }

  async view(userId: string, now = new Date()): Promise<StreakView> {
    const timezone = await this.timezoneOf(userId);
    return this.toView(await this.stateOf(userId), now, timezone);
  }

  private async stateOf(userId: string): Promise<StreakState> {
    const row = await this.streaks.findOne({ where: { userId } });
    return {
      currentDays: row?.currentDays ?? 0,
      longestDays: row?.longestDays ?? 0,
      lastActiveDate: row?.lastActiveDate ?? null,
    };
  }

  private async timezoneOf(userId: string): Promise<string> {
    const user = await this.users.findOne({ where: { id: userId } });
    return user?.timezone ?? 'Europe/Paris';
  }

  private toView(state: StreakState, now: Date, timezone: string): StreakView {
    // Recomputing rather than storing: "today" moves on its own.
    const probe = updateStreak(state, now, timezone);
    return {
      ...state,
      activeToday: !probe.changed,
      atRisk: isStreakAtRisk(state, now, timezone),
      timezone,
    };
  }
}
