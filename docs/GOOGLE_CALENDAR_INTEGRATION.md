# Google Calendar Integration Guide

This guide explains how to set up and use the Google Calendar integration in the JobTracker CRM application.

## Features

- **Sync with Google Calendar**: Automatically synchronize job interviews and other events with your Google Calendar
- **Two-way Sync**: Changes made in either JobTracker or Google Calendar will reflect in both places
- **Event Management**: Create, edit, and delete calendar events through an intuitive interface

## Prerequisites

1. A Google account with Calendar access
2. OAuth 2.0 credentials (client ID and client secret) from the Google Cloud Console
3. Proper redirect URIs configured in the Google Cloud Console

## Setting Up Google OAuth

### Create OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set Application Type to "Web application"
6. Add these authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://your-production-domain.com/api/auth/callback/google` (for production)
7. Click "Create" and note your Client ID and Client Secret

### Configure Environment Variables

Add these variables to your `.env.local` file:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

## Authentication Flow

The integration uses OAuth 2.0 for authentication:

1. User initiates connection by clicking "Connect Google Calendar"
2. User is redirected to Google consent screen
3. After granting permission, Google redirects back to our application
4. Application exchanges authorization code for access and refresh tokens
5. Tokens are stored securely in the database for future use

## Calendar Event Syncing

### From JobTracker to Google Calendar

When a user creates an event in JobTracker:

1. The event is saved to the local database
2. If Google Calendar integration is enabled, the event is also created in Google Calendar
3. The Google Calendar event ID is stored with the local event for future reference

### From Google Calendar to JobTracker

The application can also import events from Google Calendar:

1. User initiates an import from the Calendar section
2. Application fetches events from Google Calendar API
3. Events are matched with existing JobTracker events or created as new ones

## API Endpoints

### OAuth Initiation

```
GET /api/calendar/oauth
```

Initiates the OAuth flow and returns an authorization URL.

### OAuth Callback Processing

```
POST /api/calendar/oauth
```

Processes the OAuth callback and exchanges the code for tokens.

### Calendar Sync

```
POST /api/calendar/sync
```

Synchronizes events between JobTracker and Google Calendar.

### Manual Event Creation

```
POST /api/calendar/events
```

Creates a new event in both JobTracker and Google Calendar.

## Handling Authentication Errors

The integration includes several error handling mechanisms:

1. Token Refresh: Automatically refreshes expired access tokens
2. Error Notification: Alerts users when synchronization fails
3. Retry Logic: Attempts to retry failed operations with exponential backoff

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Ensure your Google credentials are correctly set in environment variables
2. **Events Not Syncing**: Check that your account has proper permissions for the Calendar API
3. **404 Not Found**: Verify that redirect URIs are correctly configured in Google Cloud Console

### Checking Sync Status

You can check the synchronization status from the dashboard:

1. Navigate to "Calendar" > "Settings"
2. View the "Last Sync" time and status
3. Use "Sync Now" to force an immediate synchronization

## Security Considerations

1. **Token Storage**: All tokens are stored securely in the database
2. **Scope Limitations**: The application only requests the minimum required permissions
3. **Automatic Disconnection**: Users can disconnect their Google account at any time

## Next Steps

After connecting Google Calendar:

1. Create a test event in JobTracker to verify synchronization
2. Check your Google Calendar to ensure the event appears
3. Try editing the event in Google Calendar to test two-way sync

For further assistance, refer to the [Google Calendar API documentation](https://developers.google.com/calendar/api/guides/overview). 