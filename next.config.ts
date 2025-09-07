import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors during the build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sam-portfolio-backend.liara.run',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://sam-portfolio-backend.liara.run/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'https://sam-portfolio-backend.liara.run/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
