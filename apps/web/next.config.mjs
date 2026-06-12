import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: ["@zenith/ui-tokens", "@zenith/types", "@zenith/calc"],
  output: "standalone",
  experimental: {
    outputFileTracingRoot: repoRoot,
    staleTimes: { dynamic: 30, static: 180 },
  },
  async rewrites() {
    const apiBase = process.env.API_INTERNAL_URL ?? "http://api:4000";
    return [
      {
        source: "/v1/:path*",
        destination: `${apiBase}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
