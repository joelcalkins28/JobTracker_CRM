# Google Calendar Integration Setup Guide

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Basic understanding of OAuth 2.0

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click on "New Project"
4. Enter "JobTracker CRM" as the project name
5. Click "Create"

## Step 2: Enable the Google Calendar API

1. From your new project's dashboard, navigate to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on the Google Calendar API card
4. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: JobTracker CRM
   - User support email: Your email
   - Developer contact information: Your email
   - Authorized domains: None required for local use
4. Back in the "Create OAuth client ID" form:
   - Application type: Desktop app
   - Name: JobTracker CRM
5. Click "Create"
6. A dialog will appear with your client ID and client secret - click "Download JSON"

## Step 4: Configure the Application

1. Rename the downloaded file to `credentials.json`
2. Replace the placeholder file at `/scripts/credentials.json` with your downloaded file
3. Alternatively, set the contents of your `credentials.json` file as an environment variable:
   ```
   GOOGLE_CREDENTIALS='{content of your credentials.json file}'
   ```

## Step 5: Run the Integration Scripts

1. Push local events to Google Calendar:
   ```
   npm run sync-calendar -- YOUR_USER_ID
   ```
2. Fetch events from Google Calendar:
   ```
   npm run fetch-calendar -- YOUR_USER_ID
   ```

## OAuth Authentication Flow

When you run the scripts for the first time:

1. The script will provide a URL to visit in your browser
2. Go to that URL and log in with your Google account
3. Grant the requested permissions
4. You will be directed to a page with an authorization code
5. Copy that code and paste it back into the terminal when prompted
6. The script will save the authentication token for future use

## Troubleshooting

If you encounter any issues:

1. **Invalid credentials**: Make sure your credentials.json file is correctly formatted and contains valid client ID and secret
2. **Access denied errors**: Ensure you've granted the necessary permissions during the OAuth flow
3. **Token expired**: Delete the `token.json` file in the scripts directory and run the script again to generate a new token
4. **User not found**: Make sure you're using a valid user ID from your database

## Production Deployment

For production use:

1. Update the OAuth consent screen to "In Production" status
2. Add any additional required scopes
3. Store credentials and tokens securely using environment variables
4. Consider implementing refresh token rotation for enhanced security 