import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/** Attempts (docs/data-model.md). Question definitions stay in content, never here. */

export type AttemptSource = 'CHAPTER' | 'BOOST' | 'ASSESSMENT' | 'REVIEW';

@Entity('quiz_attempt')
@Index(['userId', 'submittedAt'])
@Index(['userId', 'quizId'])
export class QuizAttemptEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 96, name: 'quiz_id' })
  quizId!: string;

  /** Stamped at start: a chapter edited later never rewrites a past attempt. */
  @Column({ type: 'varchar', length: 12, name: 'content_version' })
  contentVersion!: string;

  @Column({ type: 'varchar', length: 16, default: 'CHAPTER' })
  source!: AttemptSource;

  @CreateDateColumn({ type: 'timestamptz', name: 'started_at' })
  startedAt!: Date;

  @Column({ type: 'timestamptz', name: 'submitted_at', nullable: true })
  submittedAt!: Date | null;

  @Column({ type: 'int', name: 'score_percent', nullable: true })
  scorePercent!: number | null;

  @Column({ type: 'boolean', nullable: true })
  passed!: boolean | null;
}

@Entity('attempt_answer')
@Index(['attemptId'])
export class AttemptAnswerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'attempt_id' })
  attemptId!: string;

  @Column({ type: 'varchar', length: 96, name: 'question_id' })
  questionId!: string;

  /** JSONB: an answer is an index list, a boolean or a string depending on type. */
  @Column({ type: 'jsonb', nullable: true })
  given!: number[] | boolean | string | null;

  @Column({ type: 'boolean', name: 'is_correct' })
  isCorrect!: boolean;

  @Column({ type: 'int', name: 'time_spent_ms', default: 0 })
  timeSpentMs!: number;
}

export const QUIZ_ENTITIES = [QuizAttemptEntity, AttemptAnswerEntity];
