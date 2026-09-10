import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The audit trail behind every mastery move. Append-only, and the reason is a
 * full sentence rather than a code: a learner must be able to be told why
 * (CDC §66).
 */
export class MasteryChange1757692800000 implements MigrationInterface {
  name = 'MasteryChange1757692800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "mastery_change" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "skill_id" varchar(96) NOT NULL,
        "from_score" real NOT NULL,
        "to_score" real NOT NULL,
        "reason" text NOT NULL,
        "source_type" varchar(32) NOT NULL,
        "source_id" varchar(96) NOT NULL,
        "occurred_at" timestamptz NOT NULL,
        CONSTRAINT "PK_mastery_change" PRIMARY KEY ("id"),
        CONSTRAINT "FK_mastery_change_user" FOREIGN KEY ("user_id")
          REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_mastery_change_skill" ON "mastery_change" ("user_id", "skill_id", "occurred_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "mastery_change"`);
  }
}
