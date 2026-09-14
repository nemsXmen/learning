import { PARAMETERS } from '@app/learning-engine';
import type { ContentGraph } from '@app/content';
import type { ProgressStatus } from '@app/types';

/**
 * Pure projection of content + learner state into the catalog payloads.
 *
 * Kept free of Nest and TypeORM so lock resolution and progress aggregation can
 * be tested without a database — they are the parts that must not be wrong.
 */

export interface ProgressRow {
  chapterId: string;
  status: ProgressStatus;
  progressPercent: number;
  lastAccessedAt: Date | null;
}

export interface MasteryRow {
  skillId: string;
  masteryScore: number;
}

export interface LockReason {
  code: 'PREREQUISITE_SKILLS';
  skills: Array<{ id: string; name: string; mastery: number; required: number }>;
}

export interface ChapterView {
  id: string;
  slug: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  difficulty: number;
  xp: number;
  status: ProgressStatus;
  progressPercent: number;
  locked: boolean;
  lockReason: LockReason | null;
}

export interface ModuleView {
  slug: string;
  title: string;
  order: number;
  /** The part this module belongs to, null for a technology without parts. */
  part: string | null;
  progressPercent: number;
  chapters: ChapterView[];
}

export interface TechnologySummary {
  slug: string;
  name: string;
  description: string;
  progressPercent: number;
  moduleCount: number;
  chapterCount: number;
  masteredSkillCount: number;
  skillCount: number;
}

/** A group of modules. A declared part with no module yet reads as upcoming. */
export interface PartView {
  slug: string;
  title: string;
  order: number;
  description: string | null;
  progressPercent: number;
  moduleSlugs: string[];
}

export interface TechnologyDetail extends Omit<TechnologySummary, 'moduleCount' | 'chapterCount'> {
  parts: PartView[];
  modules: ModuleView[];
  continue: { chapterSlug: string; moduleSlug: string; progressPercent: number } | null;
}

export interface SkillGraphView {
  technologySlug: string;
  skills: Array<{
    id: string;
    name: string;
    importance: number;
    mastery: number;
    requires: string[];
  }>;
}

const UNLOCK_THRESHOLD = PARAMETERS.mastery.unlockThreshold;
const MASTERED_THRESHOLD = PARAMETERS.mastery.masteredThreshold;

function round(value: number): number {
  return Math.round(value);
}

/** Chapter progress averaged; an absent row counts as zero, never as missing. */
function averagePercent(values: number[]): number {
  if (values.length === 0) return 0;
  return round(values.reduce((total, value) => total + value, 0) / values.length);
}

/**
 * A chapter unlocks when every prerequisite skill reaches the pass threshold.
 * The reason is computed here and returned, so no screen has to re-derive it
 * (features/05-learning-catalog/CONTRACT.md).
 */
export function resolveLock(
  prerequisiteSkillIds: string[],
  mastery: Map<string, number>,
  skillNames: Map<string, string>,
): { locked: boolean; lockReason: LockReason | null } {
  const failing = prerequisiteSkillIds
    .map((id) => ({
      id,
      name: skillNames.get(id) ?? id,
      mastery: round(mastery.get(id) ?? 0),
      required: UNLOCK_THRESHOLD,
    }))
    .filter((skill) => skill.mastery < UNLOCK_THRESHOLD);

  if (failing.length === 0) return { locked: false, lockReason: null };
  return { locked: true, lockReason: { code: 'PREREQUISITE_SKILLS', skills: failing } };
}

/**
 * The skills a chapter needs before it can be opened: the skills of the chapters
 * it declares as prerequisites. Content declares prerequisites between chapters;
 * unlocking is decided on skills (CDC §19, §27).
 */
export function prerequisiteSkillsOf(graph: ContentGraph, chapterId: string): string[] {
  const byId = new Map(graph.chapters.map((chapter) => [chapter.id, chapter]));
  const chapter = byId.get(chapterId);
  if (!chapter) return [];

  const skills = new Set<string>();
  for (const prerequisiteId of chapter.prerequisites) {
    for (const skillId of byId.get(prerequisiteId)?.skills ?? []) skills.add(skillId);
  }
  return [...skills];
}

export function buildTechnologyList(
  graph: ContentGraph,
  progress: ProgressRow[],
  mastery: MasteryRow[],
): TechnologySummary[] {
  const progressByChapter = new Map(progress.map((row) => [row.chapterId, row]));
  const masteryBySkill = new Map(mastery.map((row) => [row.skillId, row.masteryScore]));

  return graph.technologies
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((technology) => {
      const chapters = graph.chapters.filter((c) => c.technology === technology.slug);
      const skills = graph.skills.filter((s) => s.technology === technology.slug);

      return {
        slug: technology.slug,
        name: technology.name,
        description: technology.description,
        progressPercent: averagePercent(
          chapters.map((c) => progressByChapter.get(c.id)?.progressPercent ?? 0),
        ),
        moduleCount: graph.modules.filter((m) => m.technology === technology.slug).length,
        chapterCount: chapters.length,
        masteredSkillCount: skills.filter(
          (s) => (masteryBySkill.get(s.id) ?? 0) >= MASTERED_THRESHOLD,
        ).length,
        skillCount: skills.length,
      };
    });
}

export function buildTechnologyDetail(
  graph: ContentGraph,
  technologySlug: string,
  progress: ProgressRow[],
  mastery: MasteryRow[],
): TechnologyDetail | null {
  const technology = graph.technologies.find((item) => item.slug === technologySlug);
  if (!technology) return null;

  const progressByChapter = new Map(progress.map((row) => [row.chapterId, row]));
  const masteryBySkill = new Map(mastery.map((row) => [row.skillId, row.masteryScore]));
  const skillNames = new Map(graph.skills.map((skill) => [skill.id, skill.name]));

  const modules: ModuleView[] = graph.modules
    .filter((module) => module.technology === technologySlug)
    .sort((a, b) => a.order - b.order)
    .map((module) => {
      const chapters: ChapterView[] = graph.chapters
        .filter((c) => c.technology === technologySlug && c.module === module.slug)
        .sort((a, b) => a.order - b.order)
        .map((chapter) => {
          const row = progressByChapter.get(chapter.id);
          const lock = resolveLock(
            prerequisiteSkillsOf(graph, chapter.id),
            masteryBySkill,
            skillNames,
          );

          return {
            id: chapter.id,
            slug: chapter.slug,
            title: chapter.title,
            order: chapter.order,
            estimatedMinutes: chapter.estimatedMinutes,
            difficulty: chapter.difficulty,
            xp: chapter.xp,
            status: row?.status ?? 'NOT_STARTED',
            progressPercent: row?.progressPercent ?? 0,
            ...lock,
          };
        });

      return {
        slug: module.slug,
        title: module.title,
        order: module.order,
        part: module.part ?? null,
        // Derived from its chapters, so the two can never disagree.
        progressPercent: averagePercent(chapters.map((c) => c.progressPercent)),
        chapters,
      };
    });

  const allChapters = modules.flatMap((module) =>
    module.chapters.map((chapter) => ({ module, chapter })),
  );
  const skills = graph.skills.filter((s) => s.technology === technologySlug);

  // Derived from the chapters of its modules, like every level above a chapter,
  // so a part can never disagree with the modules it groups.
  const parts: PartView[] = technology.parts
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((part) => {
      const members = modules.filter((module) => module.part === part.slug);
      return {
        slug: part.slug,
        title: part.title,
        order: part.order,
        description: part.description ?? null,
        progressPercent: averagePercent(
          members.flatMap((module) => module.chapters.map((chapter) => chapter.progressPercent)),
        ),
        moduleSlugs: members.map((module) => module.slug),
      };
    });

  return {
    slug: technology.slug,
    name: technology.name,
    description: technology.description,
    progressPercent: averagePercent(allChapters.map(({ chapter }) => chapter.progressPercent)),
    masteredSkillCount: skills.filter((s) => (masteryBySkill.get(s.id) ?? 0) >= MASTERED_THRESHOLD)
      .length,
    skillCount: skills.length,
    parts,
    modules,
    continue: pickContinue(allChapters, progressByChapter),
  };
}

/**
 * The most recently opened unfinished chapter, else the first unlocked one that
 * has not been started. Never a locked or completed chapter.
 */
function pickContinue(
  entries: Array<{ module: ModuleView; chapter: ChapterView }>,
  progressByChapter: Map<string, ProgressRow>,
): TechnologyDetail['continue'] {
  const inProgress = entries
    .filter(({ chapter }) => chapter.status === 'IN_PROGRESS' && !chapter.locked)
    .sort(
      (a, b) =>
        (progressByChapter.get(b.chapter.id)?.lastAccessedAt?.getTime() ?? 0) -
        (progressByChapter.get(a.chapter.id)?.lastAccessedAt?.getTime() ?? 0),
    )[0];

  const chosen =
    inProgress ??
    entries.find(({ chapter }) => chapter.status === 'NOT_STARTED' && !chapter.locked);

  if (!chosen) return null;
  return {
    chapterSlug: chosen.chapter.slug,
    moduleSlug: chosen.module.slug,
    progressPercent: chosen.chapter.progressPercent,
  };
}

export function buildSkillGraph(
  graph: ContentGraph,
  technologySlug: string,
  mastery: MasteryRow[],
): SkillGraphView | null {
  if (!graph.technologies.some((item) => item.slug === technologySlug)) return null;

  const masteryBySkill = new Map(mastery.map((row) => [row.skillId, row.masteryScore]));

  return {
    technologySlug,
    skills: graph.skills
      .filter((skill) => skill.technology === technologySlug)
      .map((skill) => ({
        id: skill.id,
        name: skill.name,
        importance: skill.importance,
        mastery: round(masteryBySkill.get(skill.id) ?? 0),
        requires: skill.requires,
      })),
  };
}
