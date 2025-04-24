# Google OAuth Setup Guide

This guide will walk you through the steps required to set up Google OAuth for the JobTracker CRM application.

## Prerequisites

- A Google account
- Access to the [Google Cloud Console](https://console.cloud.google.com/)
- The JobTracker CRM application code

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "JobTracker CRM")
5. Click "Create"
6. Wait for the project to be created and then select it from the dropdown

## Step 2: Enable Required APIs

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - Google Calendar API
   - Gmail API
   - Google People API (optional, for contact integration)
3. Click on each API and click the "Enable" button

## Step 3: Configure OAuth Consent Screen

1. In the Google Cloud Console, navigate to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (or "Internal" if using Google Workspace)
3. Click "Create"
4. Fill in the required information:
   - App name: "JobTracker CRM"
   - User support email: Your email address
   - Developer contact information: Your email address
5. Click "Save and Continue"
6. Add the following scopes:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.compose`
   - `https://www.googleapis.com/auth/gmail.labels`
7. Click "Save and Continue"
8. Add test users (including your own email address)
9. Click "Save and Continue"
10. Review the information and click "Back to Dashboard"

## Step 4: Create OAuth Client ID

1. In the Google Cloud Console, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name for the client (e.g., "JobTracker CRM Web Client")
5. Add the following authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - Your production domain (if applicable)
6. Add the following authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `http://localhost:3000/api/auth/[...nextauth]/route`
   - Your production domain equivalents (if applicable)
7. Click "Create"
8. Note down the Client ID and Client Secret (you'll need these later)

## Step 5: Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local` in the root of your JobTracker CRM project:
   ```
   cp .env.local.example .env.local
   ```

2. Open the `.env.local` file and add your Google OAuth credentials:
   ```
   # Google OAuth
   GOOGLE_CLIENT_ID="your-client-id-here"
   GOOGLE_CLIENT_SECRET="your-client-secret-here"

   # NextAuth configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-secure-random-string"

   # JWT configuration
   JWT_SECRET="another-secure-random-string"
   ```

3. Replace `your-client-id-here` and `your-client-secret-here` with the values obtained in Step 4
4. For the `NEXTAUTH_SECRET` and `JWT_SECRET`, use secure random strings. You can generate these with:
   ```
   openssl rand -base64 32
   ```

## Step 6: Test the Integration

1. Start the application:
   ```
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/login`
3. Click the "Sign in with Google" button
4. You should be redirected to the Google consent screen
5. After approving, you should be redirected back to your application and logged in

## Troubleshooting

### Error: "redirect_uri_mismatch"

- Make sure the redirect URIs in your Google Cloud Console match exactly with the URLs your application is using
- Check for trailing slashes or http vs https mismatches

### Error: "invalid_client"

- Double-check your client ID and client secret in the `.env.local` file
- Ensure you're using the correct credentials for the environment (development vs production)

### Error: "access_denied"

- Check that you've added your email as a test user in the OAuth consent screen settings
- Ensure the scopes are correctly configured

### Token Refresh Issues

- If you're experiencing token expiration issues, check that your refresh token flow is working correctly
- Ensure your application is requesting `access_type=offline` during authentication

## Next Steps

After setting up Google OAuth, you can:

1. Test calendar integration by creating events in the application
2. Test email integration by sending and receiving emails
3. Add additional scopes if needed for other Google services
4. Configure production settings for deployment

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Documentation](https://next-auth.js.org/providers/google)
- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Gmail API Documentation](https://developers.google.com/gmail/api/guides) 