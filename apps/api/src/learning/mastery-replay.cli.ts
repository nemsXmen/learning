import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MasteryReplayService } from './mastery-replay.service';

/**
 * `pnpm mastery:replay [userId]` — rebuilds mastery from attempt history.
 *
 * Run it after changing a coefficient in `parameters.ts`, or if a mastery
 * listener ever failed. Idempotent: the same history always yields the same
 * state.
 */
async function main(): Promise<void> {
  const userId = process.argv[2];

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['warn', 'error'],
  });

  try {
    const replay = app.get(MasteryReplayService);
    const reports = userId ? [await replay.replay(userId)] : await replay.replayAll();

    if (reports.length === 0) {
      console.log('Aucun apprenant à rejouer.');
      return;
    }

    for (const report of reports) {
      console.log(
        `✓ ${report.userId} : ${report.events} événement(s) ` +
          `(${report.attempts} tentative(s), ${report.completions} chapitre(s)) ` +
          `→ ${report.skills} compétence(s)`,
      );
      if (report.orphanedSkills.length > 0) {
        console.log(`  ignorées, absentes du contenu : ${report.orphanedSkills.join(', ')}`);
      }
    }
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
