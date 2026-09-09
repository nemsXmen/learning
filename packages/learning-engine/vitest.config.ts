import { defineConfig } from 'vitest/config';

/**
 * The engine is the one package with an enforced coverage floor: CDC §73 and
 * §89.24 require it to be tested exhaustively.
 */
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/types.ts', 'src/**/*.test.ts'],
      thresholds: { lines: 95, functions: 95, branches: 90, statements: 95 },
    },
  },
});
