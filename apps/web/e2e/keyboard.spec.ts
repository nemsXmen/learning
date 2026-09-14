import { expect, test, type Page } from '@playwright/test';
import { SCREENS, STORAGE_STATE } from './paths';

/**
 * Keyboard traversal and motion (CDC §85, rules.md #24).
 *
 * axe reads the document; it cannot tell whether a person can actually get
 * through a screen with a keyboard, whether they can see where they are, or
 * whether the interface still moves after they asked it not to.
 */

interface Stop {
  tag: string;
  type: string;
  text: string;
  visible: boolean;
}

/** The element the browser considers focused, described the way a user meets it. */
async function focused(page: Page): Promise<Stop> {
  return page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element || element === document.body) {
      return { tag: 'body', type: '', text: '', visible: false };
    }

    const drawn = (target: Element) => {
      const style = getComputedStyle(target);
      const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
      // Tailwind's focus ring is a box-shadow, not an outline.
      const ring = style.boxShadow !== 'none' && style.boxShadow.trim() !== '';
      return outline || ring;
    };

    // A visually hidden control (an sr-only radio behind a styled label) draws its
    // outline on a 1px box nobody can see; only its label can show the focus.
    const rect = element.getBoundingClientRect();
    const hidden = rect.width <= 1 || rect.height <= 1;
    const label = element.closest('label');

    return {
      tag: element.tagName.toLowerCase(),
      type: element.getAttribute('type') ?? '',
      text: (element.getAttribute('aria-label') ?? element.textContent ?? '').trim().slice(0, 60),
      visible: hidden ? Boolean(label && drawn(label)) : drawn(element),
    };
  });
}

/** Walks the tab order, collecting what is reached. */
async function tabThrough(page: Page, steps: number): Promise<Stop[]> {
  const stops: Stop[] = [];
  for (let i = 0; i < steps; i += 1) {
    await page.keyboard.press('Tab');
    stops.push(await focused(page));
  }
  return stops;
}

/** Tabs until the focused element matches, the way a person hunts for a control. */
async function tabUntil(
  page: Page,
  matches: (stop: Stop) => boolean,
  backwards = false,
  max = 40,
): Promise<Stop> {
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press(backwards ? 'Shift+Tab' : 'Tab');
    const stop = await focused(page);
    if (matches(stop)) return stop;
  }
  throw new Error(`aucune tabulation n’a atteint l’élément attendu en ${max} pressions`);
}

/** The one thing each screen exists for; it has to be reachable without a mouse. */
const PRIMARY_ACTION: Partial<Record<string, RegExp>> = {
  '/': /créer mon parcours|commencer/i,
  '/dashboard': /commencer|reprendre|renforcer|explorer/i,
  '/learn/javascript/variables': /test|marquer comme terminé/i,
  '/boost': /commencer le boost/i,
};

for (const screen of SCREENS) {
  test.describe(screen.authenticated ? 'connecté' : 'public', () => {
    test.use(screen.authenticated ? { storageState: STORAGE_STATE } : { storageState: undefined });

    test(`${screen.name} : le focus reste visible à chaque tabulation`, async ({ page }) => {
      await page.goto(screen.path);
      await page.waitForLoadState('networkidle');
      if (screen.authenticated) {
        expect(new URL(page.url()).pathname, 'session perdue, écran non testé').toBe(screen.path);
      }

      const reached = (await tabThrough(page, 30)).filter((stop) => stop.tag !== 'body');
      expect(reached.length, 'la tabulation n’atteint rien').toBeGreaterThan(0);

      // Nobody should have to guess where they are.
      const invisible = reached.filter((stop) => !stop.visible).map((stop) => `${stop.tag} « ${stop.text} »`);
      expect(invisible, 'focus invisible').toEqual([]);

      const primary = PRIMARY_ACTION[screen.path];
      if (primary) {
        expect(
          reached.some((stop) => primary.test(stop.text)),
          `action principale ${primary} inatteignable en 30 tabulations`,
        ).toBe(true);
      }
    });
  });
}

test.describe('parcours au clavier', () => {
  test('le formulaire de connexion se remplit et se soumet au clavier', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/adresse e-mail/i).focus();
    await page.keyboard.type('inconnu@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Motdepasse123!');

    // Enter from inside the form submits it, without reaching for a mouse.
    await page.keyboard.press('Enter');
    await expect(page.getByRole('alert').or(page.getByText(/identifiants/i))).toBeVisible({
      timeout: 15_000,
    });
  });

  test.describe('connecté', () => {
    test.use({ storageState: STORAGE_STATE });

    test('le lien d’évitement est la première tabulation et mène au contenu', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      await page.keyboard.press('Tab');
      expect((await focused(page)).text).toMatch(/aller au contenu/i);
      // Hidden until focused, then it must actually be seen.
      await expect(page.getByRole('link', { name: /aller au contenu/i })).toBeVisible();

      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#contenu$/);
    });

    test('le test se passe entièrement au clavier, et le résultat ne dépend pas de la couleur', async ({
      page,
    }) => {
      await page.goto('/learn/javascript/variables/quiz');
      const counter = page.getByText(/Question 1 sur \d+/);
      await expect(counter).toBeVisible({ timeout: 20_000 });
      const total = Number((await counter.textContent())?.match(/sur (\d+)/)?.[1]);
      expect(total).toBeGreaterThan(0);

      const isAnswer = (stop: Stop) => stop.tag === 'input';
      const isNext = (stop: Stop) => stop.tag === 'button' && /suivant|corriger/i.test(stop.text);

      for (let question = 1; question <= total; question += 1) {
        await expect(page.getByText(new RegExp(`Question ${question} sur ${total}`))).toBeVisible();

        // The first question is reached from the top of the page; the others sit
        // just before the navigation button that was pressed, so walk back.
        const control = await tabUntil(page, isAnswer, question > 1);
        if (control.type === 'text') await page.keyboard.type('undefined');
        else await page.keyboard.press('Space');

        await tabUntil(page, isNext);
        await page.keyboard.press('Enter');
      }

      await expect(page.getByRole('heading', { name: /quiz réussi|pas encore/i })).toBeVisible({
        timeout: 20_000,
      });
      // Correctness has to be readable without colour: a word and a glyph per question.
      await expect(page.getByText(/✓ Correct|✕ Incorrect/)).toHaveCount(total);
    });

    test('une session de Boost se déroule entièrement au clavier', async ({ page }) => {
      await page.goto('/boost');
      await page.waitForLoadState('networkidle');

      // The duration is picked by keyboard too, and its radios are visually hidden.
      const duration = await tabUntil(page, (stop) => stop.type === 'radio');
      expect(duration.visible, 'focus invisible sur le choix de durée').toBe(true);
      await page.keyboard.press('ArrowRight');

      await tabUntil(page, (stop) => stop.tag === 'button' && /commencer le boost/i.test(stop.text));
      await page.keyboard.press('Enter');
      await page.waitForURL(/\/boost\/session\//, { timeout: 20_000 });

      // Step progress is announced, not only drawn.
      const counter = page.locator('[aria-live="polite"]', { hasText: /Étape \d+ sur \d+/ });
      await expect(counter).toBeVisible({ timeout: 20_000 });
      const total = Number((await counter.textContent())?.match(/sur (\d+)/)?.[1]);
      expect(total).toBeGreaterThan(0);

      for (let step = 1; step <= total; step += 1) {
        await expect(page.getByText(new RegExp(`Étape ${step} sur ${total}`))).toBeVisible();

        // Questions need an answer; explanation steps only need to be acknowledged.
        if ((await page.locator('main input:not([disabled])').count()) > 0) {
          const control = await tabUntil(page, (stop) => stop.tag === 'input');
          if (control.type === 'text') await page.keyboard.type('x');
          else await page.keyboard.press('Space');
        }

        await tabUntil(page, (stop) => stop.tag === 'button' && /^(valider|continuer)$/i.test(stop.text));
        await page.keyboard.press('Enter');
        await expect(page.getByText(/✓ Correct|✕ Incorrect/)).toBeVisible();

        await tabUntil(
          page,
          (stop) => stop.tag === 'button' && /étape suivante|terminer la session/i.test(stop.text),
        );
        await page.keyboard.press('Enter');
      }

      await expect(page.getByRole('heading', { name: /session terminée/i })).toBeVisible({
        timeout: 20_000,
      });
    });
  });
});

/** Elements whose transition or animation still lasts longer than a millisecond. */
async function movingElements(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      [...document.querySelectorAll('*')].filter((element) => {
        const style = getComputedStyle(element);
        const longest = (value: string) =>
          Math.max(...value.split(',').map((part) => parseFloat(part) || 0));
        // 0.01ms is what the reduced-motion rule leaves behind; anything longer moves.
        return longest(style.transitionDuration) > 0.001 || longest(style.animationDuration) > 0.001;
      }).length,
  );
}

test.describe('mouvement réduit', () => {
  for (const screen of [
    { name: 'landing', path: '/', authenticated: false },
    { name: 'tableau de bord', path: '/dashboard', authenticated: true },
  ]) {
    test.describe(screen.authenticated ? 'connecté' : 'public', () => {
      test.use(screen.authenticated ? { storageState: STORAGE_STATE } : { storageState: undefined });

      test(`${screen.name} : plus rien ne bouge quand le mouvement est réduit`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.goto(screen.path);
        await page.waitForLoadState('networkidle');

        // Without this the check below could pass on a page that never moved.
        expect(await movingElements(page), 'aucune transition à neutraliser').toBeGreaterThan(0);

        await page.emulateMedia({ reducedMotion: 'reduce' });
        expect(await movingElements(page)).toBe(0);
      });
    });
  }
});
