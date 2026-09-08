import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { REQUIRED_SECTIONS } from '@app/validation';
import { loadContentGraph } from './index';
import { contentVersion } from './loader';
import { extractRelativeLinks, extractSections, parseFrontmatter } from './frontmatter';
import type { IssueCode } from './issues';

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                    */
/* -------------------------------------------------------------------------- */

const created: string[] = [];

async function tree(files: Record<string, string>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'content-'));
  created.push(dir);
  for (const [path, body] of Object.entries(files)) {
    const absolute = join(dir, path);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, body, 'utf8');
  }
  return dir;
}

afterEach(async () => {
  await Promise.all(created.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

const sections = REQUIRED_SECTIONS.map((section) => `## ${section}\n\nDu contenu.\n`).join('\n');

function lesson(frontmatter: string, body = sections): string {
  return `---\n${frontmatter}\n---\n\n# Titre\n\n${body}`;
}

const VALID_FRONTMATTER = `id: js-alpha
title: Alpha
slug: alpha
technology: javascript
level: beginner
module: fundamentals
order: 1
estimatedMinutes: 20
difficulty: 2
xp: 60
prerequisites: []
skills:
  - alpha
tags: []`;

const VALID_QUIZ = `id: js-alpha-quiz
kind: QUIZ
questions:
  - id: js-alpha-q1
    type: multiple_choice
    difficulty: 1
    question: Une question ?
    options:
      - Bonne
      - Mauvaise
    answer: [0]
    explanation: Parce que.
    skills:
      - alpha`;

function validTree(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    'javascript/technology.yaml':
      'slug: javascript\nname: JavaScript\norder: 1\ndescription: Du JS.\npublished: true\n',
    'javascript/skills.yaml':
      'skills:\n  - id: alpha\n    name: Alpha\n    importance: 3\n    requires: []\n',
    'javascript/fundamentals/module.yaml': 'slug: fundamentals\ntitle: Fondamentaux\norder: 1\n',
    'javascript/fundamentals/alpha/lesson.md': lesson(VALID_FRONTMATTER),
    'javascript/fundamentals/alpha/quiz.yaml': VALID_QUIZ,
    ...overrides,
  };
}

async function codesFor(files: Record<string, string>): Promise<IssueCode[]> {
  const result = await loadContentGraph(await tree(files));
  return result.ok ? [] : result.issues.map((issue) => issue.code);
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                     */
/* -------------------------------------------------------------------------- */

describe('parseFrontmatter', () => {
  it('splits frontmatter from the body and records key lines', () => {
    const parsed = parseFrontmatter('---\nid: a\ntitle: T\n---\n\n# Titre\n');
    expect(parsed?.data).toEqual({ id: 'a', title: 'T' });
    expect(parsed?.keyLines).toEqual({ id: 2, title: 3 });
    expect(parsed?.bodyStartLine).toBe(5);
  });

  it('returns null without frontmatter or on invalid YAML', () => {
    expect(parseFrontmatter('# Pas de frontmatter')).toBeNull();
    expect(parseFrontmatter('---\nid: [unclosed\n---\n')).toBeNull();
  });

  it('handles CRLF line endings', () => {
    expect(parseFrontmatter('---\r\nid: a\r\n---\r\n\r\n# T\r\n')?.data).toEqual({ id: 'a' });
  });
});

describe('extractSections', () => {
  it('reports level-2 headings with their real line', () => {
    expect(extractSections('## Un\n\ntexte\n\n## Deux\n', 10)).toEqual([
      { text: 'Un', line: 10 },
      { text: 'Deux', line: 14 },
    ]);
  });
});

describe('extractRelativeLinks', () => {
  it('keeps relative targets and drops URLs and anchors', () => {
    const links = extractRelativeLinks(
      '[a](./a.png) [b](https://x.dev) [c](#ancre) [d](../d.md)',
      1,
    );
    expect(links.map((link) => link.target)).toEqual(['./a.png', '../d.md']);
  });
});

describe('contentVersion', () => {
  it('is stable for identical input and changes on any byte', () => {
    expect(contentVersion('abc')).toBe(contentVersion('abc'));
    expect(contentVersion('abc')).not.toBe(contentVersion('abd'));
  });
});

/* -------------------------------------------------------------------------- */
/* Loading a valid tree                                                        */
/* -------------------------------------------------------------------------- */

describe('loadContentGraph', () => {
  it('builds a complete graph from a valid tree', async () => {
    const result = await loadContentGraph(await tree(validTree()));
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.technologies).toHaveLength(1);
    expect(result.value.modules).toHaveLength(1);
    expect(result.value.skills).toHaveLength(1);
    expect(result.value.chapters).toHaveLength(1);
    expect(result.value.quizzes[0]?.questions).toHaveLength(1);
    expect(result.value.chapters[0]?.contentVersion).toMatch(/^[0-9a-f]{12}$/);
    expect(result.value.chapters[0]?.contentPath).toBe(
      'javascript/fundamentals/alpha/lesson.md',
    );
  });

  it('is deterministic: the same tree yields the same versions', async () => {
    const dir = await tree(validTree());
    const first = await loadContentGraph(dir);
    const second = await loadContentGraph(dir);
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(first.value.chapters[0]?.contentVersion).toBe(second.value.chapters[0]?.contentVersion);
  });

  it('reports an empty content directory rather than treating it as valid', async () => {
    expect(await codesFor({})).toContain('EMPTY_CONTENT_DIR');
    const missing = await loadContentGraph(join(tmpdir(), 'content-absent-xyz'));
    expect(missing.ok).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Every documented issue code                                                 */
/* -------------------------------------------------------------------------- */

describe('validation issues', () => {
  it('MISSING_FRONTMATTER_FIELD when a required field is absent', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/alpha/lesson.md': lesson(
          VALID_FRONTMATTER.replace('estimatedMinutes: 20\n', ''),
        ),
      }),
    );
    expect(codes).toContain('MISSING_FRONTMATTER_FIELD');
  });

  it('MISSING_FRONTMATTER_FIELD when a value is out of range', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/alpha/lesson.md': lesson(
          VALID_FRONTMATTER.replace('difficulty: 2', 'difficulty: 9'),
        ),
      }),
    );
    expect(codes).toContain('MISSING_FRONTMATTER_FIELD');
  });

  it('MISSING_SECTION when a required heading is absent', async () => {
    const withoutMistakes = REQUIRED_SECTIONS.filter((s) => s !== 'Erreurs fréquentes')
      .map((section) => `## ${section}\n\nDu contenu.\n`)
      .join('\n');
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/alpha/lesson.md': lesson(VALID_FRONTMATTER, withoutMistakes),
      }),
    );
    expect(codes).toContain('MISSING_SECTION');
  });

  it('MALFORMED_FILE on absent frontmatter and on broken YAML', async () => {
    expect(
      await codesFor(
        validTree({ 'javascript/fundamentals/alpha/lesson.md': '# Sans frontmatter\n' }),
      ),
    ).toContain('MALFORMED_FILE');

    expect(
      await codesFor(validTree({ 'javascript/skills.yaml': 'skills: [unclosed\n' })),
    ).toContain('MALFORMED_FILE');
  });

  it('UNKNOWN_SKILL when a chapter teaches an undeclared skill', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/alpha/lesson.md': lesson(
          VALID_FRONTMATTER.replace('  - alpha', '  - fantome'),
        ),
      }),
    );
    expect(codes).toContain('UNKNOWN_SKILL');
  });

  it('UNKNOWN_PREREQUISITE when a chapter requires an unknown chapter', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/alpha/lesson.md': lesson(
          VALID_FRONTMATTER.replace('prerequisites: []', 'prerequisites: [js-inconnu]'),
        ),
      }),
    );
    expect(codes).toContain('UNKNOWN_PREREQUISITE');
  });

  it('CYCLIC_SKILL_GRAPH on a prerequisite cycle', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/skills.yaml':
          'skills:\n' +
          '  - id: alpha\n    name: A\n    importance: 3\n    requires: [beta]\n' +
          '  - id: beta\n    name: B\n    importance: 3\n    requires: [alpha]\n',
      }),
    );
    expect(codes).toContain('CYCLIC_SKILL_GRAPH');
  });

  it('CYCLIC_SKILL_GRAPH on a self-reference', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/skills.yaml':
          'skills:\n  - id: alpha\n    name: A\n    importance: 3\n    requires: [alpha]\n',
      }),
    );
    expect(codes).toContain('CYCLIC_SKILL_GRAPH');
  });

  it('DUPLICATE_ID when two chapters share an id', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/beta/lesson.md': lesson(
          VALID_FRONTMATTER.replace('slug: alpha', 'slug: beta'),
        ),
      }),
    );
    expect(codes).toContain('DUPLICATE_ID');
  });

  it('DUPLICATE_SLUG within a technology, but not across technologies', async () => {
    const sameTechnology = await codesFor(
      validTree({
        'javascript/fundamentals/beta/lesson.md': lesson(
          VALID_FRONTMATTER.replace('id: js-alpha', 'id: js-beta'),
        ),
      }),
    );
    expect(sameTechnology).toContain('DUPLICATE_SLUG');

    const otherTechnology = await codesFor({
      ...validTree(),
      'typescript/technology.yaml':
        'slug: typescript\nname: TypeScript\norder: 2\ndescription: Du TS.\npublished: true\n',
      'typescript/skills.yaml':
        'skills:\n  - id: ts-alpha\n    name: Alpha\n    importance: 3\n    requires: []\n',
      'typescript/fundamentals/module.yaml': 'slug: fundamentals\ntitle: Fondamentaux\norder: 1\n',
      'typescript/fundamentals/alpha/lesson.md': lesson(
        VALID_FRONTMATTER.replace('id: js-alpha', 'id: ts-alpha')
          .replace('technology: javascript', 'technology: typescript')
          .replace('  - alpha', '  - ts-alpha'),
      ),
    });
    expect(otherTechnology).not.toContain('DUPLICATE_SLUG');
  });

  it('MISSING_EXPLANATION when a question has no explanation', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/alpha/quiz.yaml': VALID_QUIZ.replace(
          '    explanation: Parce que.\n',
          '',
        ),
      }),
    );
    expect(codes).toContain('MISSING_EXPLANATION');
  });

  it('ANSWER_OUT_OF_RANGE when an index exceeds the options', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/alpha/quiz.yaml': VALID_QUIZ.replace(
          'answer: [0]',
          'answer: [7]',
        ),
      }),
    );
    expect(codes).toContain('ANSWER_OUT_OF_RANGE');
  });

  it('INVALID_QUIZ when a single-choice question has two answers', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/alpha/quiz.yaml': VALID_QUIZ.replace(
          'answer: [0]',
          'answer: [0, 1]',
        ),
      }),
    );
    expect(codes).toContain('INVALID_QUIZ');
  });

  it('INVALID_QUIZ when a graded question has no answer at all', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/alpha/quiz.yaml': VALID_QUIZ.replace('    answer: [0]\n', ''),
      }),
    );
    expect(codes).toContain('INVALID_QUIZ');
  });

  it('BROKEN_LINK when a relative link points nowhere', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/alpha/lesson.md': lesson(
          VALID_FRONTMATTER,
          `${sections}\n[schéma](./absent.png)\n`,
        ),
      }),
    );
    expect(codes).toContain('BROKEN_LINK');
  });

  it('accepts a relative link that resolves', async () => {
    const result = await loadContentGraph(
      await tree(
        validTree({
          'javascript/fundamentals/alpha/lesson.md': lesson(
            VALID_FRONTMATTER,
            `${sections}\n[schéma](./present.svg)\n`,
          ),
          'javascript/fundamentals/alpha/present.svg': '<svg></svg>',
        }),
      ),
    );
    expect(result.ok).toBe(true);
  });

  it('collects every problem in one run instead of stopping at the first', async () => {
    const codes = await codesFor(
      validTree({
        'javascript/fundamentals/alpha/lesson.md': lesson(
          VALID_FRONTMATTER.replace('  - alpha', '  - fantome').replace(
            'prerequisites: []',
            'prerequisites: [js-inconnu]',
          ),
        ),
        'javascript/fundamentals/alpha/quiz.yaml': VALID_QUIZ.replace('answer: [0]', 'answer: [7]'),
      }),
    );
    expect(new Set(codes)).toEqual(
      new Set(['UNKNOWN_SKILL', 'UNKNOWN_PREREQUISITE', 'ANSWER_OUT_OF_RANGE']),
    );
  });
});
