import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship raw TS entry points in dev — let Next transpile them.
  transpilePackages: ['@zenith/ui-tokens', '@zenith/types', '@zenith/calc'],
  // Self-contained server bundle for the Docker image (monorepo-aware tracing).
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: repoRoot,
  },
};

export default nextConfig;
