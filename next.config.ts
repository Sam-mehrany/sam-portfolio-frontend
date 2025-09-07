import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // This allows Next.js to optimize images served from your backend
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sam-portfolio-backend.liara.run',
        pathname: '/uploads/**',
      },
    ],
  },
  
  // This proxies all API and upload requests to your live backend
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
