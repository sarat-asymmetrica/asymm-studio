import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    include: [
      'packages/asymm-aesthetic-engine/**/*.test.ts',
      'packages/asymm-bio-resonance/**/*.test.ts',
      'apps/lab-site/src/**/*.test.ts'
    ],
    exclude: ['**/node_modules/**', '_source_material/**', '**/dist/**']
  }
});
