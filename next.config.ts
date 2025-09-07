import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors during the build
    ignoreDuringBuilds: true,
  },
  images: {
    // Allow images hosted by the backend
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
        // Proxy API requests to the backend app
        source: '/api/:path*',
        destination: 'https://sam-portfolio-backend.liara.run/api/:path*',
      },
      {
        // Proxy uploads access to the backend app
        source: '/uploads/:path*',
        destination: 'https://sam-portfolio-backend.liara.run/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
