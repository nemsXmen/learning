import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Identity tables (docs/data-model.md). Owned by the auth module and nothing else. */

export type EmailTokenPurpose = 'VERIFY_EMAIL' | 'RESET_PASSWORD';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** citext: two addresses differing only in case are the same account. */
  @Index({ unique: true })
  @Column({ type: 'citext' })
  email!: string;

  /** argon2id. Never returned, never logged. */
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 80, name: 'display_name' })
  displayName!: string;

  @Column({ type: 'varchar', length: 64, default: 'Europe/Paris' })
  timezone!: string;

  @Column({ type: 'varchar', length: 32 })
  goal!: string;

  @Column({ type: 'int', name: 'daily_minutes_target' })
  dailyMinutesTarget!: number;

  /** Null until the address is confirmed; an unverified account can still learn. */
  @Column({ type: 'timestamptz', name: 'email_verified_at', nullable: true })
  emailVerifiedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}

/**
 * Refresh tokens are single use and rotated. Only the hash is stored: a database
 * read must not hand anyone a session.
 */
@Entity('refresh_token')
@Index(['userId'])
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, name: 'token_hash' })
  tokenHash!: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', name: 'revoked_at', nullable: true })
  revokedAt!: Date | null;

  /** Set when this token was rotated, so a replayed token can revoke its family. */
  @Column({ type: 'uuid', name: 'replaced_by_id', nullable: true })
  replacedById!: string | null;

  /** Groups every token descended from one login. Reuse revokes the whole family. */
  @Index()
  @Column({ type: 'uuid', name: 'family_id' })
  familyId!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}

/**
 * Verification and reset tokens. The plaintext exists only in the emailed link;
 * this table holds a hash, so reading the database cannot take over an account
 * (docs/rules.md #32).
 */
@Entity('email_token')
@Index(['userId', 'purpose'])
export class EmailTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 16 })
  purpose!: EmailTokenPurpose;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, name: 'token_hash' })
  tokenHash!: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', name: 'consumed_at', nullable: true })
  consumedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}

export const AUTH_ENTITIES = [UserEntity, RefreshTokenEntity, EmailTokenEntity];
