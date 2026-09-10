import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import type { XpReason } from '@app/types';

/**
 * XP is a ledger, never a counter (CDC §52). The uniqueness constraint is what
 * actually stops farming: the second insert for the same effort simply conflicts.
 */
@Entity('xp_transaction')
@Unique('UQ_xp_once', ['userId', 'reason', 'referenceType', 'referenceId'])
@Index(['userId', 'createdAt'])
export class XpTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'varchar', length: 32 })
  reason!: XpReason;

  @Column({ type: 'varchar', length: 32, name: 'reference_type' })
  referenceType!: string;

  @Column({ type: 'varchar', length: 96, name: 'reference_id' })
  referenceId!: string;

  /** The engine's sentence, so a gain can be explained later. */
  @Column({ type: 'text' })
  detail!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}

@Entity('streak')
export class StreakEntity {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'int', name: 'current_days', default: 0 })
  currentDays!: number;

  @Column({ type: 'int', name: 'longest_days', default: 0 })
  longestDays!: number;

  /** Local calendar day, `YYYY-MM-DD`, in the learner's own timezone. */
  @Column({ type: 'varchar', length: 10, name: 'last_active_date', nullable: true })
  lastActiveDate!: string | null;
}

@Entity('user_achievement')
export class UserAchievementEntity {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @PrimaryColumn({ type: 'varchar', length: 48 })
  code!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'unlocked_at' })
  unlockedAt!: Date;
}

export const GAMIFICATION_ENTITIES = [XpTransactionEntity, StreakEntity, UserAchievementEntity];
