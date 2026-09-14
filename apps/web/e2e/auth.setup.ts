import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE } from './paths';

/**
 * Registers a throwaway learner and saves the session.
 *
 * The audit needs a real authenticated account: the protected screens are the
 * ones with the most interactive surface, and stubbing the session would mean
 * auditing a page the product never serves.
 */
const EMAIL = 'audit-a11y@example.com';
const PASSWORD = 'Motdepasse123!';

setup('register a learner and keep the session', async ({ page }) => {
  // A stable account, signed into when it already exists. A fresh address per
  // run looked cleaner but registration is rate limited, so repeated audits
  // locked themselves out — and an audit nobody can re-run is not a gate.
  const registered = await page.request.post('/api/auth/register', {
    data: {
      email: EMAIL,
      password: PASSWORD,
      displayName: 'Audit',
      goal: 'BETTER_DEVELOPER',
      dailyMinutesTarget: 30,
      timezone: 'Europe/Paris',
    },
  });

  if (registered.status() !== 201) {
    const signedIn = await page.request.post('/api/auth/login', {
      data: { email: EMAIL, password: PASSWORD },
    });
    expect(
      signedIn.ok(),
      `inscription ${registered.status()} puis connexion ${signedIn.status()}: ${await signedIn.text()}`,
    ).toBe(true);
  }

  // Give the learner some history, so the audited screens are not all empty
  // states: a read chapter and a graded attempt light up the dashboard.
  await page.request.post('/api/learn/chapters/javascript-variables/progress', {
    data: { progressPercent: 100, timeSpentSeconds: 300 },
  });
  const attempt = await page.request.post('/api/learn/javascript/variables/quiz/attempts');
  if (attempt.ok()) {
    const { attemptId, questions } = (await attempt.json()) as {
      attemptId: string;
      questions: Array<{ id: string; type: string }>;
    };
    await page.request.post(`/api/quiz/attempts/${attemptId}/submit`, {
      data: {
        answers: questions.map((question) => ({
          questionId: question.id,
          given: question.type === 'true_false' ? true : [0],
        })),
      },
    });
  }

  // Prove the session works before saving it: an empty state would turn every
  // authenticated audit into a second audit of the login page, silently green.
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard/);

  await page.context().storageState({ path: STORAGE_STATE });
});
