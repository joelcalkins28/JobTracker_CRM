# JobTracker CRM Deployment Guide

## Pre-Deployment Checklist

### 1. Security & Environment Variables
- [x] Move all hardcoded credentials to environment variables
- [x] Create `.env.example` file with placeholders for required variables
- [ ] Verify Google OAuth credentials are properly secured
- [ ] Ensure JWT secrets are properly configured

### 2. Application Structure
- [x] Fix Edge runtime compatibility issues in middleware
- [ ] Ensure all API routes are functioning properly
- [ ] Test Google OAuth callback route (currently returning 404)

### 3. Testing
- [ ] Test authentication flow end-to-end
- [ ] Verify Google Calendar integration
- [ ] Test all CRUD operations for jobs, contacts, and events

## Detailed Documentation

For in-depth guidance on specific aspects of deployment, refer to these specialized guides:

- [OAuth Fix Guide](./OAUTH_FIX.md) - Steps to resolve Google OAuth callback 404 errors
- [API Testing Guide](./API_TESTING.md) - Comprehensive testing procedures for all API endpoints
- [Database Setup Guide](./DATABASE_SETUP.md) - Production database configuration options and setup
- [Environment Variables Guide](./ENV_SETUP.md) - Management of environment variables across environments
- [Deployment Status](./DEPLOYMENT_STATUS.md) - Current status and remaining tasks

## Issues to Fix Before Deployment

### 1. Fix Google OAuth Callback Route
The Google OAuth callback route is currently returning a 404 error. To fix this:

1. Ensure the callback URL in the Google Cloud Console matches exactly what's used in the application
2. Verify the route is properly defined in the codebase
3. Check for any errors in the callback route implementation

```bash
# Test the callback route manually
curl -I http://localhost:3001/api/auth/callback/google
```

### 2. Update Environment Variables
Make sure all required environment variables are set in both development and production:

```bash
# Create a local .env file for development
cp .env.example .env.local

# Update the values with your actual credentials
nano .env.local
```

### 3. Database Migration for Production
Before deploying, you need to prepare your database:

```bash
# Generate the Prisma client
npx prisma generate

# Create a migration for production
npx prisma migrate deploy
```

## Deployment to Vercel

### 1. Prepare Repository
```bash
# Ensure the .gitignore file is properly set up
cat > .gitignore << EOL
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env
!.env.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Google API credentials
client_secret*
token.json
credentials.json
scripts/token.json
scripts/credentials.json
EOL

# Verify no sensitive files will be committed
git add .
git status
```

### 2. Configure Vercel Environment Variables
- Sign in to Vercel
- Import your GitHub repository
- Add the following environment variables in Vercel's dashboard:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_URL` (set to your deployed URL)
  - `NEXTAUTH_SECRET`
  - `DATABASE_URL`
  - `JWT_SECRET`

### 3. Deploy
- Connect your GitHub repository to Vercel
- Configure the build settings:
  - Root directory: `jobtracker`
  - Build command: `npm run build`
  - Install command: `npm install`
  - Output directory: `.next`

### 4. Post-Deployment Configuration
- Update Google OAuth allowed redirect URIs in Google Cloud Console to include your deployed URL
- Test authentication flow in production
- Verify database connections are working correctly

### 5. Common Deployment Issues and Solutions

#### Edge Runtime Compatibility
If you continue to have issues with Edge Runtime compatibility:

1. Create a new file at `next.config.js` to configure Edge runtime:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'bcrypt', // Add Node.js packages that need to be externalized
    ],
  },
  middleware: {
    skipEdgeRuntime: true,
  }
}

module.exports = nextConfig
```

2. Alternatively, move authentication logic from middleware to API routes

#### Database Connection Issues
If you encounter database connection problems:

1. Verify your connection string format is correct for your database provider
2. Ensure your database is accessible from Vercel's servers
3. Check database user permissions

#### OAuth Configuration
If Google OAuth doesn't work in production:

1. Add your production domain to the authorized redirect URIs in Google Cloud Console
2. Ensure the `NEXTAUTH_URL` environment variable is set correctly in Vercel
3. Check that all required scopes are properly configured

## Ongoing Maintenance
- Set up CI/CD pipeline for automated testing
- Configure monitoring and error tracking
- Establish backup procedure for database

## Troubleshooting
- If middleware fails, consider moving authentication logic to API routes
- For database connection issues, verify network settings and firewall rules
- For OAuth failures, check redirect URI configuration in Google Cloud Console 