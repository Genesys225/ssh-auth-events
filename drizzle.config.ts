import type { Config } from 'drizzle-kit';

export default {
  schema: './server/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite.db',
  },
  verbose: true,
  strict: true,
} satisfies Config;