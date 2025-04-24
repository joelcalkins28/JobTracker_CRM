/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages that need Node.js compatibility
  serverExternalPackages: ['bcrypt'],
  
  // Root config options (moved from experimental)
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  
  // Experimental features
  experimental: {
    serverActions: true
  }
}

module.exports = nextConfig 