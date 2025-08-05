const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  poweredByHeader: false,

  compress: false, // Handled by Express

  // Force cache invalidation for JavaScript files
  headers: async () => {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  images: {
    unoptimized: true,
  },

  experimental: {
    outputFileTracingRoot: __dirname,
    outputFileTracingIncludes: {
      '/api/**/*': ['./scripts/node/**/*'],
      '/**/*': [
        './src/components/**/*',
        './src/hooks/**/*',
        './src/types/**/*',
        './src/utils/**/*',
        './src/lib/**/*',
      ],
    },
  },

  env: {
    PROJECTS_PATH: process.env.PROJECTS_PATH,
    USER_DATA_PATH: process.env.USER_DATA_PATH,
  },

  webpack: (config, { isServer }) => {
    // Handle PDF.js worker files
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Copy PDF.js worker files
    config.module.rules.push({
      test: /pdf\.worker\.(min\.)?js/,
      type: 'asset/resource',
      generator: {
        filename: 'static/worker/[hash][ext][query]',
      },
    });

    return config;
  },
};

module.exports = nextConfig;
