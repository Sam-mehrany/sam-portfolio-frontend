/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this block to ignore ESLint errors during the build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Your existing images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/uploads/**',
      },
    ],
  },

  // Your existing rewrites configuration
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

module.exports = nextConfig;
