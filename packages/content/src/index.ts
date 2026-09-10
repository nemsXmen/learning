/**
 * Loads `content/`: frontmatter parsing, quiz parsing, skill-graph building and
 * content hashing, plus the `content:validate` checks (docs/content-model.md).
 */
import { checkGraph } from './checks';
import { readContentTree } from './loader';
import { sortIssues, type Result } from './issues';
import type { ContentGraph } from './graph';

export * from './graph';
export * from './issues';
export { contentVersion } from './loader';
export { bundledGraph } from './bundled';
export { bundleGraph, serializeGraph, GENERATED_PATH } from './bundle';
export { parseFrontmatter, extractSections, extractRelativeLinks } from './frontmatter';

/**
 * Same tree in, same graph out. Every problem is collected: the validator never
 * stops at the first issue (features/02-content-model-and-validation/CONTRACT.md).
 */
export async function loadContentGraph(dir: string): Promise<Result<ContentGraph>> {
  const { graph, issues } = await readContentTree(dir);
  const all = [...issues, ...checkGraph(graph)];

  if (all.length > 0) return { ok: false, issues: sortIssues(all) };
  return { ok: true, value: graph };
}
