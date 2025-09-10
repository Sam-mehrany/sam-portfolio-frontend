import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      // Development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000', // Updated to match backend port
        pathname: '/uploads/**',
      },
      // Production - Liara backend
      {
        protocol: 'https',
        hostname: 'sam-portfolio-backend.liara.run',
        port: '',
        pathname: '/uploads/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  async rewrites() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (isDevelopment) {
      // Development - use localhost
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/api/:path*',
        },
        {
          source: '/uploads/:path*',
          destination: 'http://localhost:3000/uploads/:path*',
        },
      ];
    }
    
    // Production - use Liara backend URL
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
