/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Environment configuration
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_ENABLE_DISCORD_INTEGRATION: process.env.NEXT_PUBLIC_ENABLE_DISCORD_INTEGRATION,
    NEXT_PUBLIC_ENABLE_VIDEO_MEETINGS: process.env.NEXT_PUBLIC_ENABLE_VIDEO_MEETINGS,
    NEXT_PUBLIC_JITSI_DOMAIN: process.env.NEXT_PUBLIC_JITSI_DOMAIN,
  },

  // Image optimization
  images: {
    unoptimized: true, // Required for Docker deployment
  },

  // Experimental features
  experimental: {
    // Enable app directory
    appDir: true,
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Rewrites for API routes (if needed)
  async rewrites() {
    return [
      // Add any necessary rewrites here
    ];
  },

  // Build optimization
  webpack: (config, { isServer }) => {
    // Add any custom webpack configuration here
    return config;
  },

  // Disable telemetry in production
  telemetry: false,
};

module.exports = nextConfig;
