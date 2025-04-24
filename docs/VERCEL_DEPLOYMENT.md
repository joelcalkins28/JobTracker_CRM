# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the JobTracker CRM application to Vercel for the first time.

## Prerequisites

1. A GitHub account
2. A Vercel account (free tier is sufficient)
3. Your updated code in the `jobtracker` directory

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and log in to your account
2. Click the "+" icon in the top-right corner and select "New repository"
3. Name your repository (e.g., "jobtracker-crm")
4. Choose "Private" for repository visibility (recommended for security)
5. Click "Create repository"
6. Follow GitHub's instructions to push your code:

```bash
# Navigate to your project directory
cd jobtracker

# Initialize a git repository (if not already done)
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit"

# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/jobtracker-crm.git

# Push the code
git push -u origin main
```

## Step 2: Sign Up for Vercel

1. Go to [Vercel](https://vercel.com) and sign up for an account
2. Choose to sign up with GitHub for easier integration
3. Complete the sign-up process

## Step 3: Import Your GitHub Repository

1. From the Vercel dashboard, click "Add New..." > "Project"
2. Find and select your "jobtracker-crm" repository
3. Vercel will automatically detect that it's a Next.js project

## Step 4: Configure Project Settings

1. **Project Name**: Enter a name for your project (e.g., "jobtracker-crm")
2. **Framework Preset**: Ensure "Next.js" is selected
3. **Root Directory**: Enter `jobtracker` (important!)
4. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

## Step 5: Configure Environment Variables

Click "Environment Variables" and add the following variables:

```
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-secure-nextauth-secret
JWT_SECRET=your-secure-jwt-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-new-google-client-id
GOOGLE_CLIENT_SECRET=your-new-google-client-secret

# Node environment
NODE_ENV=production
```

Replace placeholders with your actual values. For `NEXTAUTH_URL`, you can add a temporary value and update it after deployment with your actual Vercel domain.

## Step 6: Deploy

1. Click "Deploy"
2. Vercel will begin the deployment process, which typically takes a few minutes
3. Once completed, you'll see a success message and a link to your deployed application

## Step 7: Set Up PostgreSQL Database

1. In your Vercel dashboard, go to the "Storage" tab
2. Click "Create" and select "Postgres"
3. Follow the setup process to create a new database
4. Once created, Vercel will provide connection details
5. Update the `DATABASE_URL` environment variable with the new connection details
6. Redeploy your application for the changes to take effect

## Step 8: Run Database Migrations

You need to apply your database schema to the newly created PostgreSQL database:

1. From Vercel dashboard, go to your project
2. Click "Deployments" > latest deployment > "..." menu > "Redeploy" > "With existing Build Cache"
3. This will trigger a new deployment that includes running the database migrations

Alternatively, you can run migrations manually from your local environment:

```bash
# Update .env.local with the production database URL
npx prisma migrate deploy
```

## Step 9: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID
3. Add your Vercel domain to the authorized redirect URIs:
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google`
4. Click "Save"

## Step 10: Test Your Deployed Application

1. Visit your Vercel deployment URL
2. Test the authentication flow
3. Verify that database operations work correctly
4. Test Google OAuth integration

## Troubleshooting Common Issues

### Database Connection Issues

If you experience database connection issues:
1. Verify your `DATABASE_URL` is correct in Vercel environment variables
2. Check that your database server accepts connections from Vercel's IP addresses
3. Check for any firewall restrictions

### OAuth Redirect Issues

If you experience OAuth redirect issues:
1. Ensure your `NEXTAUTH_URL` matches your actual deployment URL
2. Verify all redirect URIs are correctly configured in Google Cloud Console
3. Check for any CORS issues

### Build Failures

If your build fails:
1. Review the build logs for errors
2. Ensure all dependencies are properly installed
3. Check for any incompatible packages or environment-specific code

## Continuous Deployment

Vercel automatically rebuilds and redeploys your application whenever you push changes to your GitHub repository. To update your application:

1. Make changes to your local codebase
2. Commit the changes: `git commit -m "Description of changes"`
3. Push to GitHub: `git push origin main`
4. Vercel will automatically detect the changes and start a new deployment 