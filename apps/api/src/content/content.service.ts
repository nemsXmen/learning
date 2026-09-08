import { Inject, Injectable, Logger, NotFoundException, type OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import {
  loadContentGraph,
  type ChapterNode,
  type ContentGraph,
  type QuizNode,
} from '@app/content';
import { CONTENT_DIR } from '../config/env';
import { REDIS } from '../redis/redis.tokens';
import { renderMarkdown, type OutlineEntry } from './markdown';

export interface ChapterPayload {
  id: string;
  title: string;
  slug: string;
  technology: { slug: string; name: string };
  module: { slug: string; title: string };
  level: string;
  order: number;
  estimatedMinutes: number;
  difficulty: number;
  xp: number;
  skills: Array<{ id: string; name: string }>;
  prerequisites: string[];
  outline: OutlineEntry[];
  html: string;
  contentVersion: string;
  neighbours: { previous: string | null; next: string | null };
}

/** No `answer`, no `explanation`: an answer key never leaves the API (CDC §9, §76). */
export interface QuizQuestionPayload {
  id: string;
  type: string;
  difficulty: number;
  question: string;
  options?: string[];
  skills: string[];
}

export interface QuizPayload {
  quizId: string;
  kind: 'QUIZ' | 'CHAPTER_TEST';
  contentVersion: string;
  questions: QuizQuestionPayload[];
}

interface RenderedChapter {
  html: string;
  outline: OutlineEntry[];
}

const CACHE_TTL_SECONDS = 60 * 60 * 24;

/**
 * The single reader of `content/` (docs/decisions.md). Loads the whole graph into
 * memory at boot — the tree is small, Git-versioned and validated in CI — and caches
 * rendered HTML in Redis keyed by content version.
 */
@Injectable()
export class ContentService implements OnModuleInit {
  private readonly logger = new Logger(ContentService.name);
  private graph: ContentGraph | null = null;

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  /** Refuses to start on an invalid tree, naming the offending paths. */
  async onModuleInit(): Promise<void> {
    const result = await loadContentGraph(CONTENT_DIR);
    if (!result.ok) {
      const summary = result.issues
        .slice(0, 10)
        .map((issue) => `  ${issue.path}:${issue.line} — ${issue.message}`)
        .join('\n');
      throw new Error(
        `Contenu invalide (${result.issues.length} problème(s)) :\n${summary}\n` +
          'Lance `pnpm content:validate` pour la liste complète.',
      );
    }

    this.graph = result.value;
    this.logger.log(
      `Contenu chargé : ${result.value.chapters.length} chapitres, ${result.value.skills.length} compétences`,
    );
  }

  getGraph(): ContentGraph {
    if (!this.graph) throw new Error('Le contenu n’est pas encore chargé');
    return this.graph;
  }

  async getChapter(technologySlug: string, chapterSlug: string): Promise<ChapterPayload> {
    const graph = this.getGraph();
    const chapter = this.findChapter(technologySlug, chapterSlug);

    const technology = graph.technologies.find((item) => item.slug === chapter.technology);
    const module = graph.modules.find(
      (item) => item.technology === chapter.technology && item.slug === chapter.module,
    );
    const rendered = await this.render(chapter);
    const skillNames = new Map(graph.skills.map((skill) => [skill.id, skill.name]));

    return {
      id: chapter.id,
      title: chapter.title,
      slug: chapter.slug,
      technology: { slug: chapter.technology, name: technology?.name ?? chapter.technology },
      module: { slug: chapter.module, title: module?.title ?? chapter.module },
      level: chapter.level,
      order: chapter.order,
      estimatedMinutes: chapter.estimatedMinutes,
      difficulty: chapter.difficulty,
      xp: chapter.xp,
      skills: chapter.skills.map((id) => ({ id, name: skillNames.get(id) ?? id })),
      prerequisites: chapter.prerequisites,
      outline: rendered.outline,
      html: rendered.html,
      contentVersion: chapter.contentVersion,
      neighbours: this.neighboursOf(chapter),
    };
  }

  async getQuiz(technologySlug: string, chapterSlug: string): Promise<QuizPayload> {
    const chapter = this.findChapter(technologySlug, chapterSlug);
    const quiz = this.getGraph().quizzes.find((item) => item.chapterId === chapter.id);
    if (!quiz) {
      throw new NotFoundException({
        code: 'CONTENT_NOT_FOUND',
        message: `Aucun quiz pour le chapitre « ${chapterSlug} »`,
      });
    }
    return toQuizPayload(quiz);
  }

  private findChapter(technologySlug: string, chapterSlug: string): ChapterNode {
    // Lookup is by value in the in-memory graph: no path ever reaches the
    // filesystem at request time, so traversal is structurally impossible.
    const chapter = this.getGraph().chapters.find(
      (item) => item.technology === technologySlug && item.slug === chapterSlug,
    );
    if (!chapter) {
      throw new NotFoundException({
        code: 'CONTENT_NOT_FOUND',
        message: `Chapitre introuvable : ${technologySlug}/${chapterSlug}`,
      });
    }
    return chapter;
  }

  /** Ordered by module then chapter, so "previous / next" follows the parcours. */
  private neighboursOf(chapter: ChapterNode): { previous: string | null; next: string | null } {
    const graph = this.getGraph();
    const moduleOrder = new Map(
      graph.modules
        .filter((module) => module.technology === chapter.technology)
        .map((module) => [module.slug, module.order]),
    );

    const ordered = graph.chapters
      .filter((item) => item.technology === chapter.technology)
      .sort(
        (a, b) =>
          (moduleOrder.get(a.module) ?? 0) - (moduleOrder.get(b.module) ?? 0) ||
          a.order - b.order,
      );

    const index = ordered.findIndex((item) => item.id === chapter.id);
    return {
      previous: index > 0 ? (ordered[index - 1]?.id ?? null) : null,
      next: index >= 0 && index < ordered.length - 1 ? (ordered[index + 1]?.id ?? null) : null,
    };
  }

  /**
   * Keyed by path AND version: editing a chapter changes its hash, so the old entry
   * is simply never read again. No manual flush, ever.
   */
  private async render(chapter: ChapterNode): Promise<RenderedChapter> {
    const key = `content:render:${chapter.contentPath}:${chapter.contentVersion}`;

    try {
      const cached = await this.redis.get(key);
      if (cached) return JSON.parse(cached) as RenderedChapter;
    } catch (error) {
      // A cache outage degrades latency, never correctness.
      this.logger.warn(`Cache illisible pour ${key} : ${(error as Error).message}`);
    }

    const rendered = renderMarkdown(chapter.body);

    try {
      await this.redis.set(key, JSON.stringify(rendered), 'EX', CACHE_TTL_SECONDS);
    } catch {
      // Same reasoning: failing to cache is not failing to serve.
    }

    return rendered;
  }
}

/** Strips the answer key. Exported so a test can assert on it directly. */
export function toQuizPayload(quiz: QuizNode): QuizPayload {
  return {
    quizId: quiz.id,
    kind: quiz.kind,
    contentVersion: quiz.contentVersion,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      type: question.type,
      difficulty: question.difficulty,
      question: question.question,
      ...(question.options ? { options: question.options } : {}),
      skills: question.skills,
    })),
  };
}
