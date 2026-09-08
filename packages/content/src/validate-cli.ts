import { resolve } from 'node:path';
import { loadContentGraph } from './index';
import { formatIssues, formatSuccess } from './report';

/** Entry point for `pnpm content:validate`. Exits non-zero on any issue (CDC §44). */
async function main(): Promise<void> {
  const dir = resolve(process.argv[2] ?? process.env['CONTENT_DIR'] ?? '../../content');
  const result = await loadContentGraph(dir);

  if (result.ok) {
    console.log(formatSuccess(result.value));
    return;
  }

  console.error(formatIssues(result.issues));
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
