import { test } from '@playwright/test';

import { STORAGE_STATE } from './paths';

/**
 * Not an assertion suite: it renders the screens a review actually looks at and
 * writes them to `e2e/__screenshots__`. Reading class names has let layout
 * regressions ship before — a fixed bar covering the end of an article, a
 * duplicated call to action — so a slice ends by looking at the pages.
 */
// A locked chapter renders its lock notice instead of the lesson, so these
// point at a chapter the seeded learner can actually open.
const SHOTS = [
  { name: 'parcours', path: '/learn/javascript' },
  { name: 'chapitre', path: '/learn/javascript/variables' },
  { name: 'chapitre-exercices', path: '/learn/javascript/variables', scrollTo: 'Exercices' },
  { name: 'chapitre-fin', path: '/learn/javascript/variables', scrollTo: "Questions d'entretien" },
  { name: 'quiz', path: '/learn/javascript/variables/quiz' },
] as const;

const VIEWPORTS = [
  { name: 'bureau', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

test.use({ storageState: STORAGE_STATE });

for (const viewport of VIEWPORTS) {
  for (const shot of SHOTS) {
    test(`${shot.name} — ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(shot.path);
      await page.waitForLoadState('networkidle');

      if ('scrollTo' in shot && shot.scrollTo) {
        const cible = page.getByRole('heading', { name: shot.scrollTo });
        if (await cible.count()) {
          await cible.first().scrollIntoViewIfNeeded();
        }
      }

      await page.screenshot({
        path: `e2e/__screenshots__/${viewport.name}-${shot.name}.png`,
      });
    });
  }
}
