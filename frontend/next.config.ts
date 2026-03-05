import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: process.env.NODE_ENV === 'production' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*` 
        : 'http://localhost:5000/api/:path*'
    }
  ]
};

export default nextConfig;

