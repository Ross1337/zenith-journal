/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship raw TS entry points in dev — let Next transpile them.
  transpilePackages: ['@zenith/ui-tokens', '@zenith/types', '@zenith/calc'],
};

export default nextConfig;
