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
      // ✅ ADD THIS NEW PATTERN FOR PRODUCTION
      {
        protocol: 'https',
        hostname: 'your-backend-hostname.liara.run', // 👈 REPLACE THIS with your actual backend hostname
        port: '', // Port is usually empty for https
        pathname: '/uploads/**',
      },
    ],
  },

  async rewrites() {
    // ... your rewrites config
  },
};

export default nextConfig;
