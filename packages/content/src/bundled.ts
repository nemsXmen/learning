import type { ContentGraph } from './graph';
import generated from './generated/content-graph.json';

/**
 * The content graph, baked in at build time by `pnpm content:bundle`.
 *
 * A static import, so every bundler traces it and no filesystem is touched at
 * runtime. Regenerate after editing `content/`; a test fails if the two drift.
 */
export const bundledGraph: ContentGraph = generated as unknown as ContentGraph;
