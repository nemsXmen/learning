import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * XP, streak and achievements (docs/data-model.md).
 *
 * Achievement definitions live in code, not in a table: they are content, they
 * are versioned with the app, and a row per definition would only be a copy that
 * can drift.
 */
export class Gamification1757779200000 implements MigrationInterface {
  name = 'Gamification1757779200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "xp_transaction" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "amount" integer NOT NULL,
        "reason" varchar(32) NOT NULL,
        "reference_type" varchar(32) NOT NULL,
        "reference_id" varchar(96) NOT NULL,
        "detail" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_xp_transaction" PRIMARY KEY ("id"),
        CONSTRAINT "FK_xp_transaction_user" FOREIGN KEY ("user_id")
          REFERENCES "user"("id") ON DELETE CASCADE,
        -- CDC §26: the same effort is never paid twice.
        CONSTRAINT "UQ_xp_once" UNIQUE ("user_id", "reason", "reference_type", "reference_id"),
        CONSTRAINT "CHK_xp_amount" CHECK ("amount" >= 0)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_xp_transaction_user" ON "xp_transaction" ("user_id", "created_at" DESC)`,
    );

    await queryRunner.query(`
      CREATE TABLE "streak" (
        "user_id" uuid NOT NULL,
        "current_days" integer NOT NULL DEFAULT 0,
        "longest_days" integer NOT NULL DEFAULT 0,
        "last_active_date" varchar(10),
        CONSTRAINT "PK_streak" PRIMARY KEY ("user_id"),
        CONSTRAINT "FK_streak_user" FOREIGN KEY ("user_id")
          REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_achievement" (
        "user_id" uuid NOT NULL,
        "code" varchar(48) NOT NULL,
        "unlocked_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_achievement" PRIMARY KEY ("user_id", "code"),
        CONSTRAINT "FK_user_achievement_user" FOREIGN KEY ("user_id")
          REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_achievement"`);
    await queryRunner.query(`DROP TABLE "streak"`);
    await queryRunner.query(`DROP TABLE "xp_transaction"`);
  }
}
