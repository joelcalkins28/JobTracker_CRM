# Production Database Setup Guide

This guide outlines the steps to set up a production database for the JobTracker CRM application.

## Database Options

For a free deployment, we have several options:

1. **PostgreSQL on Vercel Storage** (Recommended)
   - Up to 256 MB free tier
   - Seamless integration with Vercel
   - No configuration needed for connections

2. **Supabase**
   - 500 MB free tier
   - Additional features like authentication and storage
   - Requires separate account setup

3. **Railway**
   - 1 GB free tier 
   - Simple UI and monitoring
   - 500 hours of runtime per month

4. **PlanetScale (MySQL)**
   - 5GB storage in free tier
   - Branching and schema changes
   - Requires MySQL compatibility

## Setting Up PostgreSQL on Vercel

### Step 1: Create a Vercel Postgres Database

1. Log in to your Vercel account
2. Go to the Storage tab
3. Click "Create Database"
4. Select PostgreSQL
5. Name your database (e.g., "jobtracker-db")
6. Select the free plan
7. Choose a region closest to your deployment
8. Click "Create"

### Step 2: Get Connection Details

After creating the database, you'll get connection details:

- Connection string
- Host
- Database name
- Username
- Password

Add these to your environment variables in Vercel project settings.

### Step 3: Update Environment Variables

```
DATABASE_URL="postgres://username:password@host:port/database"
```

### Step 4: Update Prisma Schema

If needed, modify `prisma/schema.prisma` to ensure it's compatible with PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 5: Generate Prisma Client

```bash
cd jobtracker
npx prisma generate
```

### Step 6: Deploy Database Schema

```bash
npx prisma migrate deploy
```

## Supabase Setup (Alternative)

### Step 1: Create a Supabase Account and Project

1. Sign up at supabase.com
2. Create a new project
3. Note your connection details

### Step 2: Update Environment Variables

```
DATABASE_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
```

### Step 3: Deploy Schema

```bash
npx prisma migrate deploy
```

## Database Migration Best Practices

1. **Test Locally First**
   ```bash
   # Create a local migration
   npx prisma migrate dev --name init
   ```

2. **Review Migration Files**
   Check the generated migration SQL in `prisma/migrations` folder

3. **Use Shadow Database**
   For safer migrations, configure a shadow database:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
   }
   ```

4. **Deploy with Zero Downtime**
   ```bash
   npx prisma migrate deploy
   ```

## Data Security Best Practices

1. **Encrypt Sensitive Data**
   - Use field-level encryption for sensitive information
   - Consider Prisma middleware for automatic encryption/decryption

2. **Regular Backups**
   - Set up automated backups
   - Test restoration procedures

3. **Access Controls**
   - Limit database user permissions
   - Use connection pooling to manage connections

4. **Audit Logging**
   - Track changes to sensitive data
   - Monitor database access

## Database Performance Monitoring

1. Set up basic monitoring for:
   - Connection count
   - Query performance
   - Database size

2. Consider adding indexing for frequently queried fields:
   ```prisma
   model JobApplication {
     // ...
     @@index([userId, status])
   }
   ```

## Troubleshooting Common Issues

1. **Connection Errors**
   - Check firewall settings
   - Verify connection string format
   - Ensure IP allowlisting is configured

2. **Migration Failures**
   - Review migration logs
   - Check for conflicts with existing schema
   - Try resetting the development database

3. **Performance Issues**
   - Add proper indexing
   - Review query patterns
   - Consider connection pooling

## Next Steps After Setup

1. Run a full test suite against the production database
2. Populate with initial seed data if needed
3. Set up monitoring and alerts
4. Document database architecture and access procedures 