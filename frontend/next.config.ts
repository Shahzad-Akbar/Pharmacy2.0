import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
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

