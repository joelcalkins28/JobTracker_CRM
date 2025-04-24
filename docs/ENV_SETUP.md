# Environment Variables Setup Guide

This guide outlines the process of configuring environment variables for both local development and production deployment of the JobTracker CRM application.

## Environment Files Overview

The application uses several environment files:

- `.env.example` - Template with placeholders (safe to commit)
- `.env.local` - Local development variables (DO NOT COMMIT)
- `.env.test` - Testing environment variables (optional)
- `.env.production` - Production variables (DO NOT COMMIT)

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@localhost:5432/jobtracker` |
| `NEXTAUTH_URL` | Base URL for NextAuth | `http://localhost:3000` (dev) or `https://your-domain.com` (prod) |
| `NEXTAUTH_SECRET` | Secret for NextAuth sessions | Random string (32+ characters) |
| `JWT_SECRET` | Secret for JWT tokens | Random string (32+ characters) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | From Google Cloud Console |

## Local Development Setup

1. Copy the example file to create your local environment file:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and fill in all required values:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/jobtracker?schema=public"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-string-for-local-development"
JWT_SECRET="generate-another-random-string-for-jwt"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

3. Generate secure random strings for secrets:

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## Vercel Production Setup

1. In your Vercel project settings, navigate to "Environment Variables"

2. Add each environment variable individually or import from a .env file

3. Make sure to set `NEXTAUTH_URL` to your production domain

4. For secure variables, use Vercel's encryption options

5. Set production-specific variables:
   ```
   NODE_ENV=production
   ```

## Managing Multiple Environments

For different environments (development, staging, production):

1. Create environment-specific files:
   - `.env.development`
   - `.env.staging` 
   - `.env.production`

2. In Vercel, you can configure environment variables per deployment environment (Production, Preview, Development)

## Using Environment Variables in Code

### In Next.js API Routes or Server Components

```typescript
// Direct access
const dbUrl = process.env.DATABASE_URL;

// With fallback
const port = process.env.PORT || '3000';
```

### In Client Components

Only variables prefixed with `NEXT_PUBLIC_` are accessible in client components:

```typescript
// In .env.local
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

// In client component
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Protecting Sensitive Environment Variables

1. **Never commit** `.env.local` or any file containing actual secrets
2. Use Vercel's built-in encryption for sensitive values
3. Rotate secrets regularly, especially after team member changes
4. Use different secrets for development and production

## GitHub and Environment Variables

When working with a GitHub repository:

1. **Repository Secrets**:
   - For GitHub Actions workflows, use repository secrets in your repository settings
   - Go to Settings > Secrets and Variables > Actions > New repository secret

2. **Environment Variables in GitHub Actions**:
   ```yaml
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Build and Test
           env:
             DATABASE_URL: ${{ secrets.DATABASE_URL }}
             JWT_SECRET: ${{ secrets.JWT_SECRET }}
           run: npm test
   ```

3. **Environment Protection Rules**:
   - For production deployments, set up environment protection rules in GitHub
   - Require approval before workflows use production secrets

4. **Using .env.example**:
   - Always keep .env.example updated with all required variables (but not actual values)
   - New team members can copy this file to create their own .env.local

5. **.gitignore Configuration**:
   - Our .gitignore already contains all environment files except .env.example
   - Double-check that .env and .env.* are in .gitignore before pushing

## Troubleshooting Environment Variables

### Variables Not Loading

1. Make sure you've restarted the development server
2. Check file naming (should be `.env.local`, not just `.env`)
3. Verify variable names match exactly what's used in code

### Production Variables Not Working

1. Verify variables are set in Vercel dashboard
2. Check for typos or formatting issues
3. Ensure variables are set for the correct environment (Production/Preview/Development)
4. Review deployment logs for any environment-related errors

## Environment Variable Best Practices

1. **Least Privilege**: Only provide the minimum access needed
2. **Regular Rotation**: Change secrets periodically
3. **Documentation**: Keep an updated list of all required variables
4. **Validation**: Add startup checks to validate required variables exist
5. **Separation**: Use different values for different environments 