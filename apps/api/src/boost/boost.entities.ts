import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import type { BoostPlan } from '@app/learning-engine';

export type BoostStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

/**
 * A Boost session (CDC §17). The plan is stored as JSONB because it is an engine
 * output written once and read back whole — not a relational entity.
 *
 * Storing it also makes the session resumable: the plan a learner started is the
 * plan they finish, even if their mastery moves underneath them.
 */
@Entity('boost_session')
@Index(['userId', 'createdAt'])
export class BoostSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 16, default: 'IN_PROGRESS' })
  status!: BoostStatus;

  @Column({ type: 'jsonb' })
  plan!: BoostPlan;

  /** Answers so far, keyed by step index; lets a reload resume mid-session. */
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  answers!: Array<{ index: number; correct: boolean }>;

  @Column({ type: 'int', name: 'score_percent', nullable: true })
  scorePercent!: number | null;

  @Column({ type: 'jsonb', name: 'mastery_delta', nullable: true })
  masteryDelta!: Array<{ skillId: string; name: string; delta: number }> | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
  completedAt!: Date | null;
}

export const BOOST_ENTITIES = [BoostSessionEntity];
