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
