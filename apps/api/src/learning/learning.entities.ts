import { Column, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type { ProgressStatus } from '@app/types';

/**
 * Learning state (docs/data-model.md). Written by the progress and mastery
 * modules; the catalog only reads it, and an absent row means "nothing yet"
 * rather than an error.
 */

@Entity('user_progress')
@Index(['userId', 'status'])
export class UserProgressEntity {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @PrimaryColumn({ type: 'varchar', length: 96, name: 'chapter_id' })
  chapterId!: string;

  @Column({ type: 'varchar', length: 16, default: 'NOT_STARTED' })
  status!: ProgressStatus;

  @Column({ type: 'int', name: 'progress_percent', default: 0 })
  progressPercent!: number;

  @Column({ type: 'int', name: 'time_spent_seconds', default: 0 })
  timeSpentSeconds!: number;

  @Column({ type: 'timestamptz', name: 'last_accessed_at', nullable: true })
  lastAccessedAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
  completedAt!: Date | null;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}

/** The engine's working memory, one row per learner and skill (CDC §51). */
@Entity('skill_mastery')
@Index(['userId', 'nextReviewAt'])
export class SkillMasteryEntity {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @PrimaryColumn({ type: 'varchar', length: 96, name: 'skill_id' })
  skillId!: string;

  @Column({ type: 'real', name: 'mastery_score', default: 0 })
  masteryScore!: number;

  @Column({ type: 'real', name: 'confidence_score', default: 0 })
  confidenceScore!: number;

  @Column({ type: 'int', name: 'success_count', default: 0 })
  successCount!: number;

  @Column({ type: 'int', name: 'failure_count', default: 0 })
  failureCount!: number;

  @Column({ type: 'int', name: 'review_count', default: 0 })
  reviewCount!: number;

  @Column({ type: 'int', name: 'interval_days', default: 0 })
  intervalDays!: number;

  @Column({ type: 'timestamptz', name: 'last_attempt_at', nullable: true })
  lastAttemptAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'last_reviewed_at', nullable: true })
  lastReviewedAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'next_review_at', nullable: true })
  nextReviewAt!: Date | null;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}

export const LEARNING_ENTITIES = [UserProgressEntity, SkillMasteryEntity];
