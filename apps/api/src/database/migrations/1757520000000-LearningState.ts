import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Learning state: what the learner has done, and what the engine believes they
 * master (docs/data-model.md).
 *
 * Foreign keys point at `user` only. Chapter and skill ids reference the catalog
 * mirror, which `content:sync` rebuilds wholesale — a constraint there would make
 * a routine re-sync fail against real learner rows.
 */
export class LearningState1757520000000 implements MigrationInterface {
  name = 'LearningState1757520000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_progress" (
        "user_id" uuid NOT NULL,
        "chapter_id" varchar(96) NOT NULL,
        "status" varchar(16) NOT NULL DEFAULT 'NOT_STARTED',
        "progress_percent" integer NOT NULL DEFAULT 0,
        "time_spent_seconds" integer NOT NULL DEFAULT 0,
        "last_accessed_at" timestamptz,
        "completed_at" timestamptz,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_progress" PRIMARY KEY ("user_id", "chapter_id"),
        CONSTRAINT "FK_user_progress_user" FOREIGN KEY ("user_id")
          REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_user_progress_percent" CHECK ("progress_percent" BETWEEN 0 AND 100)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_user_progress_status" ON "user_progress" ("user_id", "status")`,
    );

    await queryRunner.query(`
      CREATE TABLE "skill_mastery" (
        "user_id" uuid NOT NULL,
        "skill_id" varchar(96) NOT NULL,
        "mastery_score" real NOT NULL DEFAULT 0,
        "confidence_score" real NOT NULL DEFAULT 0,
        "success_count" integer NOT NULL DEFAULT 0,
        "failure_count" integer NOT NULL DEFAULT 0,
        "review_count" integer NOT NULL DEFAULT 0,
        "interval_days" integer NOT NULL DEFAULT 0,
        "last_attempt_at" timestamptz,
        "last_reviewed_at" timestamptz,
        "next_review_at" timestamptz,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_skill_mastery" PRIMARY KEY ("user_id", "skill_id"),
        CONSTRAINT "FK_skill_mastery_user" FOREIGN KEY ("user_id")
          REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_skill_mastery_scores" CHECK (
          "mastery_score" BETWEEN 0 AND 100 AND "confidence_score" BETWEEN 0 AND 100
        )
      )
    `);
    // The hottest engine read: which skills are due for this learner.
    await queryRunner.query(
      `CREATE INDEX "IDX_skill_mastery_due" ON "skill_mastery" ("user_id", "next_review_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "skill_mastery"`);
    await queryRunner.query(`DROP TABLE "user_progress"`);
  }
}
