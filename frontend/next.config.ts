import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: 'http://localhost:5000/api/:path*'
    }
  ]
};

export default nextConfig;

