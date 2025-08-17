const path = require('path');
const fs = require('fs');
const BuildManager = require('./build.config.js');

/**
 * Enhanced Next.js configuration with integrated build fixes
 * This replaces the need for separate patch scripts by handling issues at the source
 */

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

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Integrated build fixes
    if (!dev) {
      // Initialize build manager for production builds
      const buildManager = new BuildManager();

      // Add custom plugin to handle build fixes
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.BUILD_INTEGRATED': JSON.stringify('true'),
        })
      );

      // Add plugin to run fixes during build
      config.plugins.push({
        apply: compiler => {
          // Run pre-build fixes
          compiler.hooks.beforeRun.tapAsync(
            'IntegratedBuildFixes',
            async (compilation, callback) => {
              try {
                console.log('🔧 Running integrated pre-build fixes...');
                await buildManager.fixSwcPlatforms();
                callback();
              } catch (error) {
                callback(error);
              }
            }
          );

          // Run post-build fixes
          compiler.hooks.afterEmit.tapAsync(
            'IntegratedPostBuildFixes',
            async (compilation, callback) => {
              try {
                console.log('🔧 Running integrated post-build fixes...');

                // Copy assets with proper error handling
                setTimeout(async () => {
                  try {
                    await buildManager.copyAssets();
                    await buildManager.fixStandaloneServer();
                  } catch (error) {
                    console.warn('⚠️ Post-build fixes warning:', error.message);
                  }
                }, 1000); // Delay to ensure files are written

                callback();
              } catch (error) {
                callback(error);
              }
            }
          );
        },
      });
    }

    // Handle PDF.js worker files
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker': 'pdfjs-dist/build/pdf.worker.min.js',
    };

    // Optimize bundle for Electron
    if (process.env.ELECTRON_BUILD) {
      config.target = 'electron-renderer';

      // Exclude Node.js modules from client bundle
      config.externals = {
        ...config.externals,
        fs: 'commonjs fs',
        path: 'commonjs path',
        os: 'commonjs os',
        child_process: 'commonjs child_process',
      };
    }

    // Enhanced module resolution for better compatibility
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      buffer: false,
    };

    // Optimize chunks for better loading
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }

    // Add source map support for better debugging
    if (!dev && process.env.NODE_ENV === 'production') {
      config.devtool = 'source-map';
    }

    return config;
  },

  // Custom build phases
  onDemandEntries: {
    // Optimize memory usage
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Enhanced error handling
  onError: (err, errorInfo) => {
    console.error('Next.js build error:', err);
    if (errorInfo) {
      console.error('Error info:', errorInfo);
    }
  },

  // Custom server configuration for standalone builds
  serverRuntimeConfig: {
    // Server-only configuration
    mySecret: 'secret',
  },

  publicRuntimeConfig: {
    // Available on both server and client
    staticFolder: '/static',
  },
};

module.exports = nextConfig;