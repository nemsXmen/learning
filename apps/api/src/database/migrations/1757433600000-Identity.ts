import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Identity tables (docs/data-model.md). Foreign keys cascade here, unlike in the
 * catalog mirror: deleting a user must take their sessions and tokens with them.
 */
export class Identity1757433600000 implements MigrationInterface {
  name = 'Identity1757433600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Case-insensitive email: two addresses differing only in case are one account.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS citext`);

    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" citext NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "display_name" varchar(80) NOT NULL,
        "timezone" varchar(64) NOT NULL DEFAULT 'Europe/Paris',
        "goal" varchar(32) NOT NULL,
        "daily_minutes_target" integer NOT NULL,
        "email_verified_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_user_email" ON "user" ("email")`);

    await queryRunner.query(`
      CREATE TABLE "refresh_token" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" varchar(64) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "revoked_at" timestamptz,
        "replaced_by_id" uuid,
        "family_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_token" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_token_user" FOREIGN KEY ("user_id")
          REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_refresh_token_hash" ON "refresh_token" ("token_hash")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_refresh_token_user" ON "refresh_token" ("user_id")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_token_family" ON "refresh_token" ("family_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "email_token" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "purpose" varchar(16) NOT NULL,
        "token_hash" varchar(64) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "consumed_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_token" PRIMARY KEY ("id"),
        CONSTRAINT "FK_email_token_user" FOREIGN KEY ("user_id")
          REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_email_token_hash" ON "email_token" ("token_hash")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_email_token_user_purpose" ON "email_token" ("user_id", "purpose")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "email_token"`);
    await queryRunner.query(`DROP TABLE "refresh_token"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
