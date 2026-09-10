import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Quiz attempts. `quiz_id` and `question_id` reference content, which
 * `content:sync` rebuilds wholesale, so no foreign key points at the catalogue —
 * a routine re-sync must not fail against real attempts.
 */
export class Attempts1757606400000 implements MigrationInterface {
  name = 'Attempts1757606400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "quiz_attempt" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "quiz_id" varchar(96) NOT NULL,
        "content_version" varchar(12) NOT NULL,
        "source" varchar(16) NOT NULL DEFAULT 'CHAPTER',
        "started_at" timestamptz NOT NULL DEFAULT now(),
        "submitted_at" timestamptz,
        "score_percent" integer,
        "passed" boolean,
        CONSTRAINT "PK_quiz_attempt" PRIMARY KEY ("id"),
        CONSTRAINT "FK_quiz_attempt_user" FOREIGN KEY ("user_id")
          REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_quiz_attempt_score" CHECK (
          "score_percent" IS NULL OR "score_percent" BETWEEN 0 AND 100
        )
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempt_history" ON "quiz_attempt" ("user_id", "submitted_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quiz_attempt_quiz" ON "quiz_attempt" ("user_id", "quiz_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "attempt_answer" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "attempt_id" uuid NOT NULL,
        "question_id" varchar(96) NOT NULL,
        "given" jsonb,
        "is_correct" boolean NOT NULL,
        "time_spent_ms" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_attempt_answer" PRIMARY KEY ("id"),
        CONSTRAINT "FK_attempt_answer_attempt" FOREIGN KEY ("attempt_id")
          REFERENCES "quiz_attempt"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_attempt_answer" UNIQUE ("attempt_id", "question_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_attempt_answer_attempt" ON "attempt_answer" ("attempt_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "attempt_answer"`);
    await queryRunner.query(`DROP TABLE "quiz_attempt"`);
  }
}
