/**
 * Stable issue codes. The validator reports every problem in one run and never
 * stops at the first (features/02-content-model-and-validation/CONTRACT.md).
 */
export const ISSUE_CODES = [
  'DUPLICATE_ID',
  'DUPLICATE_SLUG',
  'UNKNOWN_SKILL',
  'UNKNOWN_PREREQUISITE',
  'CYCLIC_SKILL_GRAPH',
  'MISSING_FRONTMATTER_FIELD',
  'MISSING_SECTION',
  'TITLE_IN_BODY',
  'MISSING_HINT',
  'INVALID_CONTAINER',
  'INVALID_QUIZ',
  'ANSWER_OUT_OF_RANGE',
  'MISSING_EXPLANATION',
  'BROKEN_LINK',
  'MALFORMED_FILE',
  'EMPTY_CONTENT_DIR',
] as const;

export type IssueCode = (typeof ISSUE_CODES)[number];

export interface ValidationIssue {
  /** Path relative to the content directory, so an author recognises it. */
  path: string;
  /** 1-indexed; 0 when the problem is the file as a whole. */
  line: number;
  code: IssueCode;
  message: string;
}

export function issue(
  path: string,
  line: number,
  code: IssueCode,
  message: string,
): ValidationIssue {
  return { path, line, code, message };
}

export type Result<T> = { ok: true; value: T } | { ok: false; issues: ValidationIssue[] };

/** Sorts by file then line, so the report reads top to bottom. */
export function sortIssues(issues: ValidationIssue[]): ValidationIssue[] {
  return [...issues].sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
}
