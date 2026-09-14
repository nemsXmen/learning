import { defineConfig, devices } from '@playwright/test';

const WEB = 'http://127.0.0.1:3000';

/**
 * The accessibility harness (CDC §85, rules.md #24).
 *
 * It runs against the real stack rather than a mocked page, because the two
 * things the criteria ask for — contrast in both themes, and keyboard traversal
 * — are properties of the rendered document. jsdom has neither a cascade nor a
 * focus ring, which is why these tests could not live beside the unit tests.
 */
export default defineConfig({
  testDir: './e2e',
  // Serial on purpose. In parallel the workers raced each other through one
  // server and one shared account, and the failing screen changed from run to
  // run — an audit that reports a different answer each time gates nothing.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env['CI'],
  retries: 0,
  reporter: process.env['CI'] ? 'github' : [['list']],

  use: {
    baseURL: WEB,
    trace: 'retain-on-failure',
  },

  // A cold server compiles on the first hit; the default 30s is not enough for
  // the first few navigations even against a build.
  timeout: 90_000,
  expect: { timeout: 15_000 },

  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'a11y',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],

  webServer: [
    {
      command: 'pnpm --filter @app/api dev',
      url: 'http://127.0.0.1:3001/health',
      cwd: '../..',
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      // A production build, not the dev server: the dev overlay adds nodes of
      // its own that axe would audit, and its HMR socket keeps the network busy
      // forever so `networkidle` never settles.
      command: 'pnpm --filter @app/web build && pnpm --filter @app/web start',
      url: WEB,
      cwd: '../..',
      reuseExistingServer: !process.env['CI'],
      timeout: 420_000,
    },
  ],
});
