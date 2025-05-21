/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      'images.pexels.com',
      'images.unsplash.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.56.1',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: false,
  // Simple configuration to handle hydration issues
  compiler: {
    // Suppress client-server value comparison
    styledComponents: true,
  },
  // Add custom webpack configuration to prevent shimming issues
  webpack: (config) => {
    // Improve compatibility with local storage operations
    config.resolve.fallback = {
      fs: false,
      path: false,
      // Add any other Node.js native modules that might be causing issues
    };
    return config;
  },
}

export default nextConfig
