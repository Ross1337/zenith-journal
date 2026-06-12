/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: `${process.env.API_INTERNAL_URL || 'http://api:4000'}/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
