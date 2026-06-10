import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url: env('DATABASE_URL') },
  migrations: {
    path: 'prisma/migrations',
    // Compiled by the regular build — works in dev and inside the Docker image.
    seed: 'node dist/seed.js',
  },
});
