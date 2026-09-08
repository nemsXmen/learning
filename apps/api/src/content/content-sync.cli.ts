import 'reflect-metadata';
import { loadContentGraph } from '@app/content';
import { DataSource } from 'typeorm';
import { CONTENT_DIR } from '../config/env';
import { dataSourceOptions } from '../database/data-source';
import {
  ChapterEntity,
  ChapterPrerequisiteEntity,
  ChapterSkillEntity,
  ModuleEntity,
  QuizEntity,
  SkillEntity,
  SkillPrerequisiteEntity,
  TechnologyEntity,
} from '../catalog/catalog.entities';
import { buildSyncPlan, idsToPrune, type SyncPlan } from './sync-plan';

/**
 * `pnpm content:sync` — projects `content/` metadata into the catalog mirror.
 * Idempotent by construction: everything is upserted on its primary key, and rows
 * whose content disappeared are pruned. Runs in one transaction, so a failure
 * leaves the previous catalog intact rather than a half-imported one.
 */
async function applyPlan(dataSource: DataSource, plan: SyncPlan): Promise<void> {
  await dataSource.transaction(async (manager) => {
    const upsert = async <T extends object>(
      entity: new () => T,
      rows: T[],
      conflictColumns: string[],
    ): Promise<void> => {
      if (rows.length > 0) await manager.upsert(entity, rows, conflictColumns);
    };

    await upsert(TechnologyEntity, plan.technologies as TechnologyEntity[], ['slug']);
    await upsert(ModuleEntity, plan.modules as ModuleEntity[], ['id']);
    await upsert(SkillEntity, plan.skills as SkillEntity[], ['id']);
    await upsert(ChapterEntity, plan.chapters as ChapterEntity[], ['id']);
    await upsert(QuizEntity, plan.quizzes as QuizEntity[], ['id']);

    // Edge tables are small and fully derived: replacing them is simpler and safer
    // than diffing, and stays inside the same transaction.
    await manager.clear(SkillPrerequisiteEntity);
    await manager.clear(ChapterSkillEntity);
    await manager.clear(ChapterPrerequisiteEntity);
    if (plan.skillPrerequisites.length > 0) {
      await manager.insert(SkillPrerequisiteEntity, plan.skillPrerequisites);
    }
    if (plan.chapterSkills.length > 0) {
      await manager.insert(ChapterSkillEntity, plan.chapterSkills);
    }
    if (plan.chapterPrerequisites.length > 0) {
      await manager.insert(ChapterPrerequisiteEntity, plan.chapterPrerequisites);
    }

    const prune = async <T extends object>(
      entity: new () => T,
      column: string,
      keptIds: string[],
    ): Promise<number> => {
      const existing: Array<Record<string, string>> = await manager
        .createQueryBuilder(entity, 'row')
        .select(`row.${column}`, column)
        .getRawMany();
      const stale = idsToPrune(keptIds, existing.map((row) => row[column] ?? ''));
      if (stale.length > 0) await manager.delete(entity, stale as never);
      return stale.length;
    };

    const removed =
      (await prune(QuizEntity, 'id', plan.quizzes.map((quiz) => quiz.id))) +
      (await prune(ChapterEntity, 'id', plan.chapters.map((chapter) => chapter.id))) +
      (await prune(SkillEntity, 'id', plan.skills.map((skill) => skill.id))) +
      (await prune(ModuleEntity, 'id', plan.modules.map((module) => module.id))) +
      (await prune(TechnologyEntity, 'slug', plan.technologies.map((t) => t.slug)));

    if (removed > 0) console.log(`  ${removed} ligne(s) obsolète(s) supprimée(s)`);
  });
}

async function main(): Promise<void> {
  const result = await loadContentGraph(CONTENT_DIR);
  if (!result.ok) {
    console.error(
      `Contenu invalide (${result.issues.length} problème(s)). Lance \`pnpm content:validate\`.`,
    );
    process.exit(1);
  }

  const plan = buildSyncPlan(result.value);
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    await applyPlan(dataSource, plan);
    console.log(
      `✓ Catalogue synchronisé : ${plan.technologies.length} technologies, ${plan.modules.length} modules, ` +
        `${plan.chapters.length} chapitres, ${plan.skills.length} compétences, ${plan.quizzes.length} quiz.`,
    );
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
