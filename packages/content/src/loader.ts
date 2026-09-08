import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, posix, relative, sep } from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { ZodTypeAny, z } from 'zod';
import {
  chapterFrontmatterSchema,
  moduleFileSchema,
  quizFileSchema,
  REQUIRED_SECTIONS,
  skillsFileSchema,
  technologyFileSchema,
} from '@app/validation';
import { extractRelativeLinks, extractSections, normaliseEol, parseFrontmatter } from './frontmatter';
import { issue, type IssueCode, type ValidationIssue } from './issues';
import type { ChapterNode, ContentGraph, ModuleNode, QuizNode, SkillNode, TechnologyNode } from './graph';

/** Same tree, same hash — the render cache and attempt stamps depend on it. */
export function contentVersion(source: string): string {
  // Hash the normalised text so a CRLF checkout does not invalidate every cache.
  return createHash('sha256').update(normaliseEol(source), 'utf8').digest('hex').slice(0, 12);
}

function toPosix(path: string): string {
  return path.split(sep).join(posix.sep);
}

/** Best-effort 1-indexed line of a top-level YAML key, for readable errors. */
function lineOfKey(source: string, key: string): number {
  const index = source.split('\n').findIndex((line) => line.trimStart().startsWith(`${key}:`));
  return index === -1 ? 1 : index + 1;
}

function zodIssues(
  error: z.ZodError,
  path: string,
  source: string,
  code: IssueCode,
  overrides?: (issuePath: string) => IssueCode | undefined,
): ValidationIssue[] {
  return error.issues.map((detail) => {
    const dotted = detail.path.join('.');
    const head = String(detail.path[0] ?? '');
    return issue(
      path,
      lineOfKey(source, head),
      overrides?.(dotted) ?? code,
      `${dotted || '(racine)'} : ${detail.message}`,
    );
  });
}

async function readYamlFile<T extends ZodTypeAny>(
  absolute: string,
  relativePath: string,
  schema: T,
  code: IssueCode,
): Promise<{ value: z.infer<T>; version: string; source: string } | { issues: ValidationIssue[] }> {
  let source: string;
  try {
    source = await readFile(absolute, 'utf8');
  } catch {
    return { issues: [issue(relativePath, 0, 'MALFORMED_FILE', 'Fichier introuvable ou illisible')] };
  }

  let raw: unknown;
  try {
    raw = parseYaml(source);
  } catch (error) {
    return {
      issues: [
        issue(
          relativePath,
          0,
          'MALFORMED_FILE',
          `YAML invalide : ${error instanceof Error ? error.message : 'erreur de syntaxe'}`,
        ),
      ],
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { issues: zodIssues(parsed.error, relativePath, source, code) };

  return { value: parsed.data, version: contentVersion(source), source };
}

async function directories(path: string): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort();
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export interface LoadedTree {
  graph: ContentGraph;
  issues: ValidationIssue[];
}

/**
 * Walks `dir` and parses every file it owns. Collects issues rather than throwing:
 * an author fixes a whole file at once, not one error per run.
 */
export async function readContentTree(dir: string): Promise<LoadedTree> {
  const issues: ValidationIssue[] = [];
  const technologies: TechnologyNode[] = [];
  const modules: ModuleNode[] = [];
  const skills: SkillNode[] = [];
  const chapters: ChapterNode[] = [];
  const quizzes: QuizNode[] = [];

  if (!(await exists(dir))) {
    return {
      graph: { technologies, modules, skills, chapters, quizzes },
      issues: [issue('.', 0, 'EMPTY_CONTENT_DIR', `Répertoire de contenu introuvable : ${dir}`)],
    };
  }

  const technologySlugs = await directories(dir);
  if (technologySlugs.length === 0) {
    issues.push(issue('.', 0, 'EMPTY_CONTENT_DIR', 'Aucune technologie dans le répertoire de contenu'));
  }

  for (const technologySlug of technologySlugs) {
    const technologyDir = join(dir, technologySlug);
    const rel = (absolute: string) => toPosix(relative(dir, absolute));

    const technologyFile = join(technologyDir, 'technology.yaml');
    const technology = await readYamlFile(
      technologyFile,
      rel(technologyFile),
      technologyFileSchema,
      'MISSING_FRONTMATTER_FIELD',
    );
    if ('issues' in technology) {
      issues.push(...technology.issues);
    } else {
      technologies.push({
        ...technology.value,
        contentPath: rel(technologyFile),
        contentVersion: technology.version,
      });
    }

    const skillsFile = join(technologyDir, 'skills.yaml');
    const skillsResult = await readYamlFile(
      skillsFile,
      rel(skillsFile),
      skillsFileSchema,
      'MISSING_FRONTMATTER_FIELD',
    );
    if ('issues' in skillsResult) {
      issues.push(...skillsResult.issues);
    } else {
      for (const skill of skillsResult.value.skills) {
        skills.push({ ...skill, technology: technologySlug });
      }
    }

    for (const moduleSlug of await directories(technologyDir)) {
      const moduleDir = join(technologyDir, moduleSlug);
      const moduleFile = join(moduleDir, 'module.yaml');
      const moduleResult = await readYamlFile(
        moduleFile,
        rel(moduleFile),
        moduleFileSchema,
        'MISSING_FRONTMATTER_FIELD',
      );
      if ('issues' in moduleResult) {
        issues.push(...moduleResult.issues);
      } else {
        modules.push({
          ...moduleResult.value,
          technology: technologySlug,
          contentPath: rel(moduleFile),
          contentVersion: moduleResult.version,
        });
      }

      for (const chapterSlug of await directories(moduleDir)) {
        const chapterDir = join(moduleDir, chapterSlug);
        const lessonFile = join(chapterDir, 'lesson.md');
        const lessonPath = rel(lessonFile);

        let source: string;
        try {
          source = await readFile(lessonFile, 'utf8');
        } catch {
          issues.push(issue(lessonPath, 0, 'MALFORMED_FILE', 'lesson.md manquant'));
          continue;
        }

        const parsed = parseFrontmatter(source);
        if (!parsed) {
          issues.push(
            issue(lessonPath, 1, 'MALFORMED_FILE', 'Frontmatter `---` absent ou YAML invalide'),
          );
          continue;
        }

        const frontmatter = chapterFrontmatterSchema.safeParse(parsed.data);
        if (!frontmatter.success) {
          issues.push(
            ...frontmatter.error.issues.map((detail) => {
              const head = String(detail.path[0] ?? '');
              return issue(
                lessonPath,
                parsed.keyLines[head] ?? 1,
                'MISSING_FRONTMATTER_FIELD',
                `${detail.path.join('.') || '(racine)'} : ${detail.message}`,
              );
            }),
          );
          continue;
        }

        const sections = extractSections(parsed.body, parsed.bodyStartLine);
        const present = new Set(sections.map((section) => section.text));
        for (const required of REQUIRED_SECTIONS) {
          if (!present.has(required)) {
            issues.push(
              issue(
                lessonPath,
                parsed.bodyStartLine,
                'MISSING_SECTION',
                `Section « ## ${required} » manquante`,
              ),
            );
          }
        }

        for (const link of extractRelativeLinks(parsed.body, parsed.bodyStartLine)) {
          const target = link.target.split('#')[0];
          if (!target) continue;
          if (!(await exists(join(chapterDir, target)))) {
            issues.push(issue(lessonPath, link.line, 'BROKEN_LINK', `Lien cassé : ${link.target}`));
          }
        }

        chapters.push({
          ...frontmatter.data,
          contentPath: lessonPath,
          contentVersion: contentVersion(source),
          body: parsed.body,
          sections: sections.map((section) => section.text),
        });

        const quizFile = join(chapterDir, 'quiz.yaml');
        if (await exists(quizFile)) {
          const quizPath = rel(quizFile);
          const quiz = await readYamlFile(quizFile, quizPath, quizFileSchema, 'INVALID_QUIZ');
          if ('issues' in quiz) {
            issues.push(
              ...quiz.issues.map((detail: ValidationIssue) =>
                detail.message.includes('explanation')
                  ? { ...detail, code: 'MISSING_EXPLANATION' as const }
                  : detail,
              ),
            );
          } else {
            quizzes.push({
              ...quiz.value,
              chapterId: frontmatter.data.id,
              technology: technologySlug,
              contentPath: quizPath,
              contentVersion: quiz.version,
            });
          }
        }
      }
    }
  }

  return { graph: { technologies, modules, skills, chapters, quizzes }, issues };
}
