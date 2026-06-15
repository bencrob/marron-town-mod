import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    // Le domaine est pur : pas besoin de jsdom ni de mock @minecraft/server.
    environment: 'node',
  },
});
