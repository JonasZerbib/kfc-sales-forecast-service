import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.ts'],
    environment: 'node',
    // DB_PASSWORD has no default in the zod schema and is required at module load
    // time (config.ts runs when any service is imported). Provide a dummy value so
    // the process does not exit before the tests run.
    env: {
      DB_PASSWORD: 'test-dummy',
    },
  },
});
