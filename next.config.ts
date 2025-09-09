// In your next.config.ts file

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      // This is your existing pattern for local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
      // This is the pattern for production
      {
        protocol: 'https',
        hostname: 'your-backend-hostname.liara.run', // 👈 REPLACE THIS with your actual backend hostname
        port: '', // Port is usually empty for https
        pathname: '/uploads/**',
      },
    ],
  },

  // ✅ FIX: This function now returns your proxy configuration for local development.
  // This resolves the build error and keeps your local setup working.
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
