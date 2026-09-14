import type { ChapterFrontmatter, Question } from '@app/validation';

export interface TechnologyNode {
  slug: string;
  name: string;
  order: number;
  description: string;
  published: boolean;
  parts: PartNode[];
  contentPath: string;
  contentVersion: string;
}

/** A group of modules; display structure only, unlocking still follows skills. */
export interface PartNode {
  slug: string;
  title: string;
  order: number;
  description?: string | undefined;
}

export interface ModuleNode {
  slug: string;
  technology: string;
  title: string;
  order: number;
  part?: string | undefined;
  contentPath: string;
  contentVersion: string;
}

export interface SkillNode {
  id: string;
  technology: string;
  name: string;
  importance: number;
  requires: string[];
}

export interface ChapterNode extends ChapterFrontmatter {
  contentPath: string;
  contentVersion: string;
  /** Markdown body without frontmatter; rendering happens in the API. */
  body: string;
  sections: string[];
}

export interface QuizNode {
  id: string;
  kind: 'QUIZ' | 'CHAPTER_TEST';
  chapterId: string;
  technology: string;
  questions: Question[];
  contentPath: string;
  contentVersion: string;
}

export interface ContentGraph {
  technologies: TechnologyNode[];
  modules: ModuleNode[];
  skills: SkillNode[];
  chapters: ChapterNode[];
  quizzes: QuizNode[];
}

export function countGraph(graph: ContentGraph): {
  technologies: number;
  modules: number;
  chapters: number;
  skills: number;
  questions: number;
} {
  return {
    technologies: graph.technologies.length,
    modules: graph.modules.length,
    chapters: graph.chapters.length,
    skills: graph.skills.length,
    questions: graph.quizzes.reduce((total, quiz) => total + quiz.questions.length, 0),
  };
}
