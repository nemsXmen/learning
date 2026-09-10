import { resolve } from 'node:path';
import { bundleGraph, GENERATED_PATH } from './bundle';
import { countGraph } from './graph';

/** `pnpm content:bundle` — regenerate the module the API imports. */
async function main(): Promise<void> {
  const dir = resolve(process.argv[2] ?? process.env['CONTENT_DIR'] ?? '../../content');
  const { graph, bytes } = await bundleGraph(dir);
  const counts = countGraph(graph);

  console.log(
    `✓ Contenu empaqueté : ${counts.chapters} chapitres, ${counts.questions} questions ` +
      `(${Math.round(bytes / 1024)} Ko) → ${GENERATED_PATH}`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
