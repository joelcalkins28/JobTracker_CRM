# Google Calendar Integration Guide

This document provides step-by-step instructions for implementing Google Calendar integration in the JobTracker CRM application.

## Overview

The Google Calendar integration will allow users to:

1. View upcoming interviews in their JobTracker dashboard
2. Create calendar events for job interviews from application details
3. Sync interview dates between JobTracker and Google Calendar
4. Receive notifications for upcoming interviews

## Prerequisites

Before starting the implementation, you'll need to set up the Google Cloud project and obtain API credentials:

1. Create a Google Cloud Platform (GCP) project
2. Enable the Google Calendar API
3. Configure OAuth consent screen
4. Create OAuth credentials
5. Set up environment variables

## Step 1: Create a Google Cloud Platform Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "New Project" at the top right
3. Enter a project name (e.g., "JobTracker CRM")
4. Click "Create"
5. Make note of your Project ID

## Step 2: Enable the Google Calendar API

1. In your GCP project, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on "Google Calendar API" in the results
4. Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace domain)
3. Click "Create"
4. Fill in the required fields:
   - App name: "JobTracker CRM"
   - User support email: Your email address
   - Developer contact information: Your email address
5. Click "Save and Continue"
6. Add the following scopes:
   - `.../auth/calendar` (Full access to Google Calendar)
   - `.../auth/calendar.events` (View and manage events on your calendars)
7. Click "Save and Continue"
8. Add test users (your email address)
9. Click "Save and Continue"
10. Review the information and click "Back to Dashboard"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name (e.g., "JobTracker CRM Web Client")
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - Your production domain (if applicable)
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-production-domain.com/api/auth/callback/google` (if applicable)
7. Click "Create"
8. Download the JSON file containing your client ID and client secret
9. Store this file securely and do not commit it to version control

## Step 5: Set Up Environment Variables

Add the following environment variables to your `.env` file:

```
# Google API credentials
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_API_KEY=your-api-key (optional, for public data only)

# OAuth configuration
NEXTAUTH_URL=http://localhost:3000 (or your production domain)
NEXTAUTH_SECRET=your-random-secret-for-encryption
```

## Implementation Steps

### Step 1: Install Dependencies

Install the required packages:

```bash
npm install @google-cloud/local-auth googleapis next-auth
```

### Step 2: Set Up Next Auth with Google Provider

1. Configure NextAuth.js to use the Google provider in `app/api/auth/[...nextauth]/route.ts`
2. Add the Calendar API scope to the Google provider configuration

### Step 3: Create Calendar API Utilities

Create utility functions in `app/lib/calendar.ts` for:

1. Authenticating with Google Calendar API
2. Creating calendar events
3. Fetching calendar events
4. Updating calendar events
5. Deleting calendar events

### Step 4: Implement Calendar Components

1. Create a calendar view component
2. Implement an event creation form
3. Add calendar integration to the application detail page
4. Update the dashboard to show upcoming calendar events

### Step 5: Create API Routes for Calendar Operations

Create API routes in `app/api/calendar/` for:

1. Listing events
2. Creating new events
3. Updating existing events
4. Deleting events
5. Handling Google OAuth callbacks

## Best Practices

1. **Error Handling**: Implement proper error handling for API calls and token refresh
2. **Token Storage**: Store OAuth tokens securely in the database
3. **User Permissions**: Request only the minimum required permissions
4. **Rate Limiting**: Be mindful of Google Calendar API rate limits
5. **Testing**: Test thoroughly with different use cases

## Further Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [NextAuth.js Documentation](https://next-auth.js.org/providers/google)
- [Googleapis Node.js Client](https://github.com/googleapis/google-api-nodejs-client)

## Troubleshooting

- **API Quota Exceeded**: If you hit rate limits, implement caching strategies
- **Authentication Errors**: Verify that OAuth scopes match your application's needs
- **Event Creation Issues**: Check that event format follows Google Calendar API specifications
- **Missing Events**: Ensure time zones are properly handled between the app and Google Calendar

---

This integration guide provides a foundation for implementing Google Calendar in the JobTracker CRM. After completing these steps, users will be able to manage their interview schedules seamlessly between the application and Google Calendar. 