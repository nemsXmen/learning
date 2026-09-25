import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bundledGraph } from './bundled';
import { GENERATED_PATH, serializeGraph } from './bundle';
import { loadContentGraph } from './index';

const CONTENT_DIR = resolve(__dirname, '..', '..', '..', 'content');

describe('bundled content', () => {
  it('carries the whole seed tree', () => {
    expect(bundledGraph.technologies.map((t) => t.slug).sort()).toEqual([
      'ai-engineering',
      'javascript',
      'typescript',
    ]);
    expect(bundledGraph.chapters.length).toBeGreaterThanOrEqual(5);
    expect(bundledGraph.quizzes.length).toBeGreaterThanOrEqual(5);
  });

  it('keeps the Markdown body, so nothing has to be read at runtime', () => {
    const closures = bundledGraph.chapters.find((c) => c.id === 'javascript-closures');
    expect(closures?.body).toContain('## Concept');
    expect(closures?.contentVersion).toMatch(/^[0-9a-f]{12}$/);
  });

  /**
   * The guard against the obvious failure: someone edits a chapter, forgets to
   * regenerate, and the API keeps serving yesterday's content.
   */
  it('matches the content tree it was generated from', async () => {
    const result = await loadContentGraph(CONTENT_DIR);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const onDisk = serializeGraph(result.value);
    const committed = await readFile(GENERATED_PATH, 'utf8');

    expect(committed).toBe(onDisk);
  }, 30_000);
});
