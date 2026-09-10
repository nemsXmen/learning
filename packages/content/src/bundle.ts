import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { loadContentGraph } from './index';
import { formatIssues } from './report';
import type { ContentGraph } from './graph';

/**
 * Turns `content/` into a JSON module the API imports statically.
 *
 * Reading the tree at runtime assumed a long-running server with the repository
 * on disk. A serverless bundler traces static imports only, so a directory read
 * through a path from an environment variable is never packaged — and a relative
 * `CONTENT_DIR` resolves against whatever working directory the platform picked.
 * Bundling removes both problems, and the cold start no longer walks a tree.
 *
 * Markdown stays the source of truth in Git (CDC §89.5); only the way it reaches
 * the runtime changes.
 */

/**
 * Always the source tree, never `dist`: the generated file is a committed
 * artefact that `tsc` then copies into the build. `__dirname` is `src` under
 * ts-node and `dist` once compiled, so strip whichever it is.
 */
export const GENERATED_PATH = resolve(
  __dirname.replace(/[\\/](?:dist|src)$/, ''),
  'src',
  'generated',
  'content-graph.json',
);

export function serializeGraph(graph: ContentGraph): string {
  // Stable key order and two-space indent: the generated file is reviewable, and
  // regenerating unchanged content produces a byte-identical diff.
  return `${JSON.stringify(graph, null, 2)}\n`;
}

export async function bundleGraph(
  contentDir: string,
  outputPath = GENERATED_PATH,
): Promise<{ graph: ContentGraph; bytes: number }> {
  const result = await loadContentGraph(contentDir);
  if (!result.ok) {
    throw new Error(`Contenu invalide, rien n'a été généré :\n${formatIssues(result.issues)}`);
  }

  const serialized = serializeGraph(result.value);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, serialized, 'utf8');

  return { graph: result.value, bytes: Buffer.byteLength(serialized, 'utf8') };
}
