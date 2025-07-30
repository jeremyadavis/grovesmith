import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimize for development stability
  experimental: {
    turbopackMemoryLimit: 4096,
  },

  // Cache optimization
  cacheHandler: undefined, // Use default caching
  cacheMaxMemorySize: 50 * 1024 * 1024, // 50MB
};

export default nextConfig;
