/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages that need Node.js compatibility
  serverExternalPackages: ['bcrypt'],
  
  // Root config options (moved from experimental)
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  
  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001']
    }
  },
  
  // Override webpack config to ensure proper resolution of imports
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      'app': './app',
    };
    
    return config;
  }
}

module.exports = nextConfig 