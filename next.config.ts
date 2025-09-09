// In your next.config.ts file

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      // Pattern for local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      // ✅ FIX: Use your actual backend hostname here
      {
        protocol: 'https',
        hostname: 'sam-portfolio-backend.liara.run',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8000/uploads/:path*',
      },
    ]
  },
};

export default nextConfig;
