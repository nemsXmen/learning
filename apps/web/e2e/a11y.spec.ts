import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { SCREENS, STORAGE_STATE, THEMES, type Theme } from './paths';

/** Forces the theme before the first paint, the way a returning visitor has it. */
async function useTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript((value) => {
    window.localStorage.setItem('atelier.theme', value as string);
  }, theme);
}

async function scan(page: Page) {
  return new AxeBuilder({ page })
    // The four WCAG levels the criteria name; colour contrast is in wcag2aa.
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
}

/** A violation, printed so the failure names the element rather than a rule id. */
function report(violations: Awaited<ReturnType<typeof scan>>['violations']): string {
  return violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}) — ${violation.help}\n` +
        violation.nodes.map((node) => `      ${node.target.join(' ')}`).join('\n'),
    )
    .join('\n');
}

for (const theme of THEMES) {
  test.describe(`thème ${theme}`, () => {
    for (const screen of SCREENS) {
      test.describe(screen.authenticated ? 'connecté' : 'public', () => {
        test.use(screen.authenticated ? { storageState: STORAGE_STATE } : { storageState: undefined });

        test(`${screen.name} n'a aucune violation axe`, async ({ page }) => {
          await useTheme(page, theme);
          await page.goto(screen.path);
          // A production build has no HMR socket, so the network does settle:
          // this waits for hydration and for client-fetched content alike.
          await page.waitForLoadState('networkidle');

          // A broken session redirects to the login screen, which passes the
          // audit — so eleven authenticated screens would report green while
          // only one was ever scanned. Assert we are where we meant to be.
          if (screen.authenticated) {
            expect(new URL(page.url()).pathname, 'session perdue, écran non audité').toBe(
              screen.path,
            );
          }

          // Set by the root script before first paint; checked so a theme that
          // failed to apply cannot pass as the other one.
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

          // Not covered by the WCAG tags above: the app shell owns the page's
          // one <main>, and a screen that renders its own would nest a second.
          await expect(page.locator('main')).toHaveCount(1);

          const { violations } = await scan(page);
          // Compared on ids so the diff stays readable; the detail — which rule,
          // which element, which contrast ratio — travels in the message.
          expect(violations.map((violation) => violation.id), report(violations)).toEqual([]);
        });
      });
    }
  });
}

// A running session is reached through a URL no static list can hold, so it is
// created here: the step screen is where the learner actually spends the Boost.
test.describe('session de Boost en cours', () => {
  test.use({ storageState: STORAGE_STATE });

  for (const theme of THEMES) {
    test(`thème ${theme} : une étape de Boost n'a aucune violation axe`, async ({ page }) => {
      const started = await page.request.post('/api/boost/sessions', {
        data: { availableMinutes: 10 },
      });
      expect(started.ok(), await started.text()).toBe(true);
      const { sessionId } = (await started.json()) as { sessionId: string };

      await useTheme(page, theme);
      await page.goto(`/boost/session/${sessionId}`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('main')).toHaveCount(1);

      const { violations } = await scan(page);
      expect(violations.map((violation) => violation.id), report(violations)).toEqual([]);
    });
  }
});
