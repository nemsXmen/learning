import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * The catalog mirror: a projection of `content/` into PostgreSQL, written by
 * `content:sync` and by nothing else (docs/data-model.md). It holds metadata only —
 * never lesson prose, never an answer key.
 *
 * Primary keys are the content ids where they exist, which is what makes the sync
 * idempotent: the same tree upserts onto the same rows.
 */

@Entity('technology')
export class TechnologyEntity {
  /** The technology slug. Natural key: content owns it, the database mirrors it. */
  @PrimaryColumn({ type: 'varchar', length: 64 })
  slug!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'int', name: 'display_order' })
  order!: number;

  @Column({ type: 'boolean', name: 'is_published', default: false })
  isPublished!: boolean;

  @Column({ type: 'varchar', length: 12, name: 'content_version' })
  contentVersion!: string;
}

@Entity('module')
@Index(['technologySlug', 'order'])
export class ModuleEntity {
  /** `<technology>/<module>` — stable across syncs without a lookup. */
  @PrimaryColumn({ type: 'varchar', length: 160 })
  id!: string;

  @Column({ type: 'varchar', length: 64, name: 'technology_slug' })
  technologySlug!: string;

  @Column({ type: 'varchar', length: 64 })
  slug!: string;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'int', name: 'display_order' })
  order!: number;

  @Column({ type: 'varchar', length: 12, name: 'content_version' })
  contentVersion!: string;
}

@Entity('skill')
@Index(['technologySlug'])
export class SkillEntity {
  @PrimaryColumn({ type: 'varchar', length: 96 })
  id!: string;

  @Column({ type: 'varchar', length: 64, name: 'technology_slug' })
  technologySlug!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'int' })
  importance!: number;
}

/** One edge of the skill graph (CDC §28). Acyclicity is enforced by content:validate. */
@Entity('skill_prerequisite')
export class SkillPrerequisiteEntity {
  @PrimaryColumn({ type: 'varchar', length: 96, name: 'skill_id' })
  skillId!: string;

  @PrimaryColumn({ type: 'varchar', length: 96, name: 'requires_skill_id' })
  requiresSkillId!: string;
}

@Entity('chapter')
@Index(['technologySlug', 'slug'], { unique: true })
export class ChapterEntity {
  @PrimaryColumn({ type: 'varchar', length: 96 })
  id!: string;

  @Column({ type: 'varchar', length: 64, name: 'technology_slug' })
  technologySlug!: string;

  @Column({ type: 'varchar', length: 64, name: 'module_slug' })
  moduleSlug!: string;

  @Column({ type: 'varchar', length: 64 })
  slug!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 24 })
  level!: string;

  @Column({ type: 'int', name: 'display_order' })
  order!: number;

  /** Where the Markdown lives. The body itself stays in Git (CDC §42). */
  @Column({ type: 'varchar', length: 400, name: 'content_path' })
  contentPath!: string;

  @Column({ type: 'varchar', length: 12, name: 'content_version' })
  contentVersion!: string;

  @Column({ type: 'int', name: 'estimated_minutes' })
  estimatedMinutes!: number;

  @Column({ type: 'int' })
  difficulty!: number;

  @Column({ type: 'int' })
  xp!: number;
}

/** A chapter teaches several skills, a skill is taught by several chapters (CDC §27). */
@Entity('chapter_skill')
export class ChapterSkillEntity {
  @PrimaryColumn({ type: 'varchar', length: 96, name: 'chapter_id' })
  chapterId!: string;

  @PrimaryColumn({ type: 'varchar', length: 96, name: 'skill_id' })
  skillId!: string;

  @Column({ type: 'int', default: 1 })
  weight!: number;
}

@Entity('chapter_prerequisite')
export class ChapterPrerequisiteEntity {
  @PrimaryColumn({ type: 'varchar', length: 96, name: 'chapter_id' })
  chapterId!: string;

  @PrimaryColumn({ type: 'varchar', length: 96, name: 'requires_chapter_id' })
  requiresChapterId!: string;
}

@Entity('quiz')
@Index(['chapterId'])
export class QuizEntity {
  @PrimaryColumn({ type: 'varchar', length: 96 })
  id!: string;

  @Column({ type: 'varchar', length: 96, name: 'chapter_id' })
  chapterId!: string;

  @Column({ type: 'varchar', length: 16 })
  kind!: string;

  @Column({ type: 'varchar', length: 400, name: 'content_path' })
  contentPath!: string;

  @Column({ type: 'varchar', length: 12, name: 'content_version' })
  contentVersion!: string;
}

export const CATALOG_ENTITIES = [
  TechnologyEntity,
  ModuleEntity,
  SkillEntity,
  SkillPrerequisiteEntity,
  ChapterEntity,
  ChapterSkillEntity,
  ChapterPrerequisiteEntity,
  QuizEntity,
];
