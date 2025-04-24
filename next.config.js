/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages that need Node.js compatibility
  serverExternalPackages: ['bcrypt'],
  
  // Root config options
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  
  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  },
  
  // Handle module resolution for app directory
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix module resolution in client-side code
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    return config;
  }
}

module.exports = nextConfig 