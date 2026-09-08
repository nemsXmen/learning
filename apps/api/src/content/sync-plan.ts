import type { ContentGraph } from '@app/content';

/**
 * The rows `content:sync` should write, derived purely from the content graph.
 * Kept free of TypeORM so the projection can be tested without a database — the
 * executor is a thin transaction around this (features/03-content-engine-api).
 */
export interface SyncPlan {
  technologies: Array<{
    slug: string;
    name: string;
    description: string;
    order: number;
    isPublished: boolean;
    contentVersion: string;
  }>;
  modules: Array<{
    id: string;
    technologySlug: string;
    slug: string;
    title: string;
    order: number;
    contentVersion: string;
  }>;
  skills: Array<{ id: string; technologySlug: string; name: string; importance: number }>;
  skillPrerequisites: Array<{ skillId: string; requiresSkillId: string }>;
  chapters: Array<{
    id: string;
    technologySlug: string;
    moduleSlug: string;
    slug: string;
    title: string;
    level: string;
    order: number;
    contentPath: string;
    contentVersion: string;
    estimatedMinutes: number;
    difficulty: number;
    xp: number;
  }>;
  chapterSkills: Array<{ chapterId: string; skillId: string; weight: number }>;
  chapterPrerequisites: Array<{ chapterId: string; requiresChapterId: string }>;
  quizzes: Array<{
    id: string;
    chapterId: string;
    kind: string;
    contentPath: string;
    contentVersion: string;
  }>;
}

export function moduleKey(technologySlug: string, moduleSlug: string): string {
  return `${technologySlug}/${moduleSlug}`;
}

/**
 * Pure projection: same graph in, same plan out. That property is what makes
 * running the sync twice a no-op.
 */
export function buildSyncPlan(graph: ContentGraph): SyncPlan {
  return {
    technologies: graph.technologies.map((technology) => ({
      slug: technology.slug,
      name: technology.name,
      description: technology.description,
      order: technology.order,
      isPublished: technology.published,
      contentVersion: technology.contentVersion,
    })),

    modules: graph.modules.map((module) => ({
      id: moduleKey(module.technology, module.slug),
      technologySlug: module.technology,
      slug: module.slug,
      title: module.title,
      order: module.order,
      contentVersion: module.contentVersion,
    })),

    skills: graph.skills.map((skill) => ({
      id: skill.id,
      technologySlug: skill.technology,
      name: skill.name,
      importance: skill.importance,
    })),

    skillPrerequisites: graph.skills.flatMap((skill) =>
      skill.requires.map((requiresSkillId) => ({ skillId: skill.id, requiresSkillId })),
    ),

    chapters: graph.chapters.map((chapter) => ({
      id: chapter.id,
      technologySlug: chapter.technology,
      moduleSlug: chapter.module,
      slug: chapter.slug,
      title: chapter.title,
      level: chapter.level,
      order: chapter.order,
      contentPath: chapter.contentPath,
      contentVersion: chapter.contentVersion,
      estimatedMinutes: chapter.estimatedMinutes,
      difficulty: chapter.difficulty,
      xp: chapter.xp,
    })),

    chapterSkills: graph.chapters.flatMap((chapter) =>
      chapter.skills.map((skillId) => ({ chapterId: chapter.id, skillId, weight: 1 })),
    ),

    chapterPrerequisites: graph.chapters.flatMap((chapter) =>
      chapter.prerequisites.map((requiresChapterId) => ({
        chapterId: chapter.id,
        requiresChapterId,
      })),
    ),

    quizzes: graph.quizzes.map((quiz) => ({
      id: quiz.id,
      chapterId: quiz.chapterId,
      kind: quiz.kind,
      contentPath: quiz.contentPath,
      contentVersion: quiz.contentVersion,
    })),
  };
}

/** Ids present in the database but no longer in the content tree. */
export function idsToPrune(planIds: string[], existingIds: string[]): string[] {
  const kept = new Set(planIds);
  return existingIds.filter((id) => !kept.has(id));
}
