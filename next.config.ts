/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    },
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'ui-avatars.com', 'avatars.githubusercontent.com'],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Add webpack configuration to handle problematic modules
  webpack: (config: any) => {
    // Add HTML loader
    config.module.rules.push({
      test: /\.html$/,
      loader: 'html-loader',
    });

    // Ignore problematic node modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mapbox/node-pre-gyp': false,
      'mock-aws-s3': false,
      'fs-extra': false,
      'fs.realpath': false,
    };

    return config;
  },
};

module.exports = nextConfig;
