import { parse as parseYaml } from 'yaml';

export interface ParsedMarkdown {
  data: unknown;
  body: string;
  /** 1-indexed line where the body starts, so body issues report real positions. */
  bodyStartLine: number;
  /** 1-indexed line of each frontmatter key, for precise error reporting. */
  keyLines: Record<string, number>;
}

/** Line endings must not change what content means, nor its hash. */
export function normaliseEol(source: string): string {
  return source.replace(/\r\n/g, '\n');
}

/**
 * Splits `---` frontmatter from the Markdown body and records where each key sits.
 * Small on purpose: one YAML dependency, no Markdown parser at this stage.
 */
export function parseFrontmatter(source: string): ParsedMarkdown | null {
  // Normalise first: a CRLF checkout would otherwise leave a trailing carriage
  // return on every YAML value, and `title: Alpha\r` is not `title: Alpha`.
  const lines = normaliseEol(source).split('\n');
  if (lines[0] !== '---') return null;

  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i] === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) return null;

  const raw = lines.slice(1, end).join('\n');
  const keyLines: Record<string, number> = {};
  for (let i = 1; i < end; i += 1) {
    const match = /^([A-Za-z][A-Za-z0-9_]*):/.exec(lines[i] ?? '');
    if (match?.[1]) keyLines[match[1]] = i + 1;
  }

  let data: unknown;
  try {
    data = parseYaml(raw) ?? {};
  } catch {
    return null;
  }

  return {
    data,
    body: lines.slice(end + 1).join('\n'),
    bodyStartLine: end + 2,
    keyLines,
  };
}

/** Level-2 headings, in document order, with their 1-indexed line in the file. */
export function extractSections(
  body: string,
  bodyStartLine: number,
): Array<{ text: string; line: number }> {
  const sections: Array<{ text: string; line: number }> = [];
  body.split('\n').forEach((line, index) => {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (match?.[1]) sections.push({ text: match[1], line: bodyStartLine + index });
  });
  return sections;
}

/**
 * Level-1 headings in the body, skipping fenced code where `# ` is a comment.
 * The chapter title comes from the frontmatter: a `# Title` in the body renders a
 * second <h1> under the one the page already draws.
 */
export function extractLevelOneHeadings(
  body: string,
  bodyStartLine: number,
): Array<{ text: string; line: number }> {
  const headings: Array<{ text: string; line: number }> = [];
  let fence: string | null = null;
  body.split('\n').forEach((line, index) => {
    const marker = /^\s*(```|~~~)/.exec(line)?.[1];
    if (marker) {
      fence = fence === null ? marker : fence === marker ? null : fence;
      return;
    }
    if (fence !== null) return;
    const match = /^#\s+(.+?)\s*$/.exec(line);
    if (match?.[1]) headings.push({ text: match[1], line: bodyStartLine + index });
  });
  return headings;
}

export type PracticeKind = 'indice' | 'solution' | 'reponse';
export type PracticeSection = 'Exercices' | "Questions d'entretien";

export interface PracticeScan {
  items: Array<{ section: PracticeSection; line: number; blocks: PracticeKind[] }>;
  problems: Array<{ line: number; message: string }>;
}

const PRACTICE_SECTIONS: readonly string[] = ['Exercices', "Questions d'entretien"];
const PRACTICE_KINDS: readonly string[] = ['indice', 'solution', 'reponse'];

/**
 * Exercises and interview questions, with the hint and solution blocks written
 * under each (docs/content-model.md). Fence-aware: `:::` inside code is code.
 */
export function scanPractice(body: string, bodyStartLine: number): PracticeScan {
  const items: PracticeScan['items'] = [];
  const problems: PracticeScan['problems'] = [];
  const lines = body.split('\n');
  let section: PracticeSection | null = null;
  let fence: string | null = null;
  let open: { kind: string; line: number } | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index] ?? '';
    const line = bodyStartLine + index;

    const marker = /^\s*(```|~~~)/.exec(raw)?.[1];
    if (marker) {
      fence = fence === null ? marker : fence === marker ? null : fence;
      continue;
    }
    if (fence !== null) continue;

    const heading = /^##\s+(.+?)\s*$/.exec(raw)?.[1];
    if (heading) {
      if (open) problems.push({ line: open.line, message: `Bloc « :::${open.kind} » jamais fermé` });
      open = null;
      section = PRACTICE_SECTIONS.includes(heading) ? (heading as PracticeSection) : null;
      continue;
    }

    if (/^\s*:::\s*$/.test(raw)) {
      if (!open) problems.push({ line, message: 'Fermeture « ::: » sans bloc ouvert' });
      open = null;
      continue;
    }

    const opener = /^\s*:::\s*(\S+)\s*$/.exec(raw)?.[1];
    if (opener) {
      if (open) problems.push({ line: open.line, message: `Bloc « :::${open.kind} » jamais fermé` });
      open = { kind: opener, line };
      const current = items[items.length - 1];
      if (!PRACTICE_KINDS.includes(opener)) {
        problems.push({ line, message: `Bloc « :::${opener} » inconnu (attendu : indice, solution ou reponse)` });
      } else if (!section || !current || current.section !== section) {
        problems.push({ line, message: `Bloc « :::${opener} » hors d'un exercice ou d'une question d'entretien` });
      } else {
        current.blocks.push(opener as PracticeKind);
      }
      continue;
    }

    if (open) continue;
    if (section && /^(\d+\.|[-*])\s+\S/.test(raw)) items.push({ section, line, blocks: [] });
  }

  if (open) problems.push({ line: open.line, message: `Bloc « :::${open.kind} » jamais fermé` });
  return { items, problems };
}

/** Relative Markdown links, excluding anchors and absolute URLs. */
export function extractRelativeLinks(
  body: string,
  bodyStartLine: number,
): Array<{ target: string; line: number }> {
  const links: Array<{ target: string; line: number }> = [];
  body.split('\n').forEach((line, index) => {
    for (const match of line.matchAll(/!?\[[^\]]*\]\(([^)\s]+)\)/g)) {
      const target = match[1];
      if (!target) continue;
      if (/^([a-z]+:)?\/\//i.test(target) || target.startsWith('#') || target.startsWith('mailto:')) {
        continue;
      }
      links.push({ target, line: bodyStartLine + index });
    }
  });
  return links;
}
