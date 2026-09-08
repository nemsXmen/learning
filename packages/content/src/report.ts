import { countGraph, type ContentGraph } from './graph';
import type { ValidationIssue } from './issues';

/**
 * Terminal output stays legible without colour and survives being piped to a CI
 * log (features/02-content-model-and-validation/UX.md).
 */
export function formatIssues(issues: ValidationIssue[]): string {
  const byFile = new Map<string, ValidationIssue[]>();
  for (const item of issues) {
    const bucket = byFile.get(item.path) ?? [];
    bucket.push(item);
    byFile.set(item.path, bucket);
  }

  const blocks = [...byFile.entries()].map(([path, items]) => {
    const lines = items.map(
      (item) => `  ${path}:${item.line} — ${item.message}  [${item.code}]`,
    );
    return lines.join('\n');
  });

  const count = issues.length;
  return `${blocks.join('\n\n')}\n\n✗ ${count} problème${count > 1 ? 's' : ''} à corriger.`;
}

export function formatSuccess(graph: ContentGraph): string {
  const counts = countGraph(graph);
  return `✓ ${counts.technologies} technologies, ${counts.modules} modules, ${counts.chapters} chapitres, ${counts.skills} compétences, ${counts.questions} questions validés.`;
}
