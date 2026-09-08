import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The catalog mirror (docs/data-model.md). Deliberately without foreign keys: it is
 * a projection of `content/` that `content:sync` rebuilds wholesale, and referential
 * integrity is already enforced upstream by `content:validate`. Constraints here
 * would only dictate a delete order without adding a guarantee.
 */
export class CatalogMirror1757347200000 implements MigrationInterface {
  name = 'CatalogMirror1757347200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "technology" (
        "slug" varchar(64) NOT NULL,
        "name" varchar(120) NOT NULL,
        "description" text NOT NULL,
        "display_order" integer NOT NULL,
        "is_published" boolean NOT NULL DEFAULT false,
        "content_version" varchar(12) NOT NULL,
        CONSTRAINT "PK_technology" PRIMARY KEY ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "module" (
        "id" varchar(160) NOT NULL,
        "technology_slug" varchar(64) NOT NULL,
        "slug" varchar(64) NOT NULL,
        "title" varchar(160) NOT NULL,
        "display_order" integer NOT NULL,
        "content_version" varchar(12) NOT NULL,
        CONSTRAINT "PK_module" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_module_technology_order" ON "module" ("technology_slug", "display_order")`,
    );

    await queryRunner.query(`
      CREATE TABLE "skill" (
        "id" varchar(96) NOT NULL,
        "technology_slug" varchar(64) NOT NULL,
        "name" varchar(160) NOT NULL,
        "importance" integer NOT NULL,
        CONSTRAINT "PK_skill" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_skill_technology" ON "skill" ("technology_slug")`,
    );

    await queryRunner.query(`
      CREATE TABLE "skill_prerequisite" (
        "skill_id" varchar(96) NOT NULL,
        "requires_skill_id" varchar(96) NOT NULL,
        CONSTRAINT "PK_skill_prerequisite" PRIMARY KEY ("skill_id", "requires_skill_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "chapter" (
        "id" varchar(96) NOT NULL,
        "technology_slug" varchar(64) NOT NULL,
        "module_slug" varchar(64) NOT NULL,
        "slug" varchar(64) NOT NULL,
        "title" varchar(200) NOT NULL,
        "level" varchar(24) NOT NULL,
        "display_order" integer NOT NULL,
        "content_path" varchar(400) NOT NULL,
        "content_version" varchar(12) NOT NULL,
        "estimated_minutes" integer NOT NULL,
        "difficulty" integer NOT NULL,
        "xp" integer NOT NULL,
        CONSTRAINT "PK_chapter" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_chapter_technology_slug" ON "chapter" ("technology_slug", "slug")`,
    );

    await queryRunner.query(`
      CREATE TABLE "chapter_skill" (
        "chapter_id" varchar(96) NOT NULL,
        "skill_id" varchar(96) NOT NULL,
        "weight" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_chapter_skill" PRIMARY KEY ("chapter_id", "skill_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "chapter_prerequisite" (
        "chapter_id" varchar(96) NOT NULL,
        "requires_chapter_id" varchar(96) NOT NULL,
        CONSTRAINT "PK_chapter_prerequisite" PRIMARY KEY ("chapter_id", "requires_chapter_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "quiz" (
        "id" varchar(96) NOT NULL,
        "chapter_id" varchar(96) NOT NULL,
        "kind" varchar(16) NOT NULL,
        "content_path" varchar(400) NOT NULL,
        "content_version" varchar(12) NOT NULL,
        CONSTRAINT "PK_quiz" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_quiz_chapter" ON "quiz" ("chapter_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "quiz"`);
    await queryRunner.query(`DROP TABLE "chapter_prerequisite"`);
    await queryRunner.query(`DROP TABLE "chapter_skill"`);
    await queryRunner.query(`DROP TABLE "chapter"`);
    await queryRunner.query(`DROP TABLE "skill_prerequisite"`);
    await queryRunner.query(`DROP TABLE "skill"`);
    await queryRunner.query(`DROP TABLE "module"`);
    await queryRunner.query(`DROP TABLE "technology"`);
  }
}
