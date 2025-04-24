# Fixing Google OAuth Callback Issues

## Current Problem
The Google OAuth callback route is returning 404 errors, preventing successful authentication with Google.

## Step 1: Check Route Configuration

The error logs show:
```
GET /api/auth/callback/google?code=4/0Ab_5qlkxRCo1DFNXT8h-rVaRbkYHJWeu5OvvXZMLacuXUzlPVT1JkLY-mOKyP9CWbWMoAQ&scope=https://www.googleapis.com/auth/calendar 404 in 1ms
```

This means our app is trying to use the route `/api/auth/callback/google`, but Next.js can't find that route.

## Step 2: Fix Files Deployment Location

The core issue appears to be related to the project structure. The error logs show:
```
npm error path /Users/joelcalkins/Library/Mobile Documents/com~apple~CloudDocs/crm_test3/package.json
npm error errno -2
npm error enoent Could not read package.json
```

And:
```
[Error: > Couldn't find any `pages` or `app` directory. Please create one under the project root]
```

This indicates all commands need to be run from inside the `jobtracker` directory, not from the parent directory.

## Step 3: Update OAuth Redirect URIs

The Google Cloud Console OAuth redirect URIs should match EXACTLY what's used in the application. Check:

1. In `/app/lib/google.ts`, we have:
   ```ts
   oauth2Client = new google.auth.OAuth2(
     process.env.GOOGLE_CLIENT_ID,
     process.env.GOOGLE_CLIENT_SECRET,
     process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : 'http://localhost:3000/api/auth/callback/google'
   );
   ```

2. In Google Cloud Console, make sure the authorized redirect URIs include:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3001/api/auth/callback/google` (since port 3001 is being used)

## Step 4: Verify the Callback Route Files

1. Ensure the file is in the right location:
   ```
   jobtracker/app/api/auth/callback/google/route.ts
   ```

2. Also verify the NextAuth callback route at:
   ```
   jobtracker/app/api/auth/[...nextauth]/route.ts
   ```

## Step 5: Testing the Fix

Run the application from the correct directory:

```bash
cd jobtracker
npm run dev
```

Then try to authenticate with Google from the login page. Monitor the console logs for any errors.

## Step 6: Debugging

If the error persists, try these debugging steps:

1. Add explicit logging in both callback routes
2. Check network requests in browser DevTools
3. Verify environment variables are loading properly
4. Check middleware configuration to ensure it allows the callback URL 