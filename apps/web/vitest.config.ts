import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Next keeps `jsx: preserve` in tsconfig for its own compiler, which leaves
  // esbuild emitting raw JSX. Component tests need the automatic runtime.
  esbuild: { jsx: 'automatic' },
  test: {
    // Node by default: most of what is tested here is server-side logic. A
    // component test opts into the DOM with `// @vitest-environment jsdom`.
    environment: 'node',
    globals: true,
    setupFiles: ['./test-setup.ts'],
    include: ['lib/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
  },
});
