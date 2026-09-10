import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Boost sessions (CDC §17, docs/data-model.md). */
export class BoostSession1757865600000 implements MigrationInterface {
  name = 'BoostSession1757865600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "boost_session" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "status" varchar(16) NOT NULL DEFAULT 'IN_PROGRESS',
        "plan" jsonb NOT NULL,
        "answers" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "score_percent" integer,
        "mastery_delta" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "completed_at" timestamptz,
        CONSTRAINT "PK_boost_session" PRIMARY KEY ("id"),
        CONSTRAINT "FK_boost_session_user" FOREIGN KEY ("user_id")
          REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_boost_score" CHECK (
          "score_percent" IS NULL OR "score_percent" BETWEEN 0 AND 100
        )
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_boost_session_user" ON "boost_session" ("user_id", "created_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "boost_session"`);
  }
}
