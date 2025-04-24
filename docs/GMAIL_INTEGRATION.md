# Gmail Integration Guide

This document provides step-by-step instructions for implementing Gmail integration in the JobTracker CRM application.

## Overview

The Gmail integration will allow users to:

1. Connect their Gmail account to JobTracker
2. View and track email correspondence with potential employers
3. Send emails directly from the JobTracker interface
4. Extract contact information from emails
5. Set up automated follow-up reminders
6. Associate emails with specific job applications

## Prerequisites

Before starting the implementation, you'll need to set up the Google Cloud project and obtain API credentials:

1. Create a Google Cloud Platform (GCP) project (same as for Calendar if you're implementing both)
2. Enable the Gmail API
3. Configure OAuth consent screen
4. Create OAuth credentials
5. Set up environment variables

## Step 1: Create a Google Cloud Platform Project

If you've already created a project for Calendar integration, you can use the same project. Otherwise:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "New Project" at the top right
3. Enter a project name (e.g., "JobTracker CRM")
4. Click "Create"
5. Make note of your Project ID

## Step 2: Enable the Gmail API

1. In your GCP project, go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" in the results
4. Click "Enable"

## Step 3: Configure OAuth Consent Screen

If you've already configured the consent screen for Calendar integration, you'll need to add additional scopes. Otherwise:

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace domain)
3. Click "Create" or "Edit" if already created
4. Fill in the required fields if creating new:
   - App name: "JobTracker CRM"
   - User support email: Your email address
   - Developer contact information: Your email address
5. Click "Save and Continue"
6. Add the following scopes:
   - `.../auth/gmail.readonly` (Read Gmail messages and settings)
   - `.../auth/gmail.send` (Send email on your behalf)
   - `.../auth/gmail.compose` (Create, read, update, and delete drafts)
   - `.../auth/gmail.labels` (Manage mailbox labels)
7. Click "Save and Continue"
8. Add test users (your email address) if not already added
9. Click "Save and Continue"
10. Review the information and click "Back to Dashboard"

## Step 4: Create or Update OAuth Credentials

If you've already created OAuth credentials for Calendar integration, you can use the same credentials. Otherwise:

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID" (or edit existing)
3. Select "Web application" as the application type
4. Enter a name (e.g., "JobTracker CRM Web Client")
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - Your production domain (if applicable)
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-production-domain.com/api/auth/callback/google` (if applicable)
7. Click "Create" or "Save"
8. Download the JSON file containing your client ID and client secret if creating new
9. Store this file securely and do not commit it to version control

## Step 5: Set Up Environment Variables

Add or update the following environment variables in your `.env` file:

```
# Google API credentials (if not already set)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# OAuth configuration (if not already set)
NEXTAUTH_URL=http://localhost:3000 (or your production domain)
NEXTAUTH_SECRET=your-random-secret-for-encryption

# Gmail-specific configuration
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.compose,https://www.googleapis.com/auth/gmail.labels
```

## Implementation Steps

### Step 1: Install Dependencies

Install the required packages:

```bash
npm install googleapis next-auth node-fetch
```

### Step 2: Update Next Auth Configuration

1. Update NextAuth.js to include Gmail API scopes in `app/api/auth/[...nextauth]/route.ts`
2. Add token rotation and persistence for long-term Gmail access

### Step 3: Create Gmail API Utilities

Create utility functions in `app/lib/gmail.ts` for:

1. Authenticating with Gmail API
2. Fetching emails
3. Sending emails
4. Creating draft emails
5. Processing email content (parsing, extracting contacts, etc.)
6. Managing labels and threads

### Step 4: Create Database Models for Email Storage

1. Update the Prisma schema to include email-related models (already defined in schema.prisma)
2. Create migration for email-related tables if needed

### Step 5: Implement Email Components

1. Create an email inbox component with filtering and search
2. Implement email detail view component
3. Create email composer component
4. Add contact extraction feature from emails
5. Implement follow-up reminder functionality

### Step 6: Create API Routes for Email Operations

Create API routes in `app/api/emails/` for:

1. Fetching emails from Gmail
2. Sending new emails
3. Creating and managing drafts
4. Associating emails with job applications
5. Setting up follow-up reminders

### Step 7: Add Background Synchronization

1. Implement a mechanism to periodically sync emails from Gmail
2. Create a webhook or polling system for real-time email updates
3. Set up notifications for new relevant emails

## Best Practices

1. **Privacy and Security**:
   - Store emails securely in your database
   - Implement proper access controls
   - Be transparent with users about how their data is used

2. **Performance**:
   - Implement pagination for email fetching
   - Use server-side filtering for large email volumes
   - Cache email data when appropriate

3. **Error Handling**:
   - Handle API rate limits gracefully
   - Implement token refresh mechanisms
   - Provide clear feedback for email delivery issues

4. **User Experience**:
   - Make the email connection process simple
   - Allow users to disconnect Gmail at any time
   - Provide clear visibility into synced emails and actions

5. **Compliance**:
   - Follow Gmail API terms of service
   - Respect user privacy and data protection regulations
   - Implement proper data retention policies

## Troubleshooting

- **Authentication Issues**: Verify scopes are correctly configured in both GCP and your application
- **Missing Emails**: Check query parameters for email fetching and verify sync is working
- **Sending Failures**: Ensure proper authentication and formatting for outgoing emails
- **Rate Limiting**: Implement backoff strategies for API requests
- **Token Expiration**: Verify token refresh mechanisms are working correctly

## Further Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api/guides)
- [NextAuth.js Documentation](https://next-auth.js.org/providers/google)
- [Googleapis Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
- [Email Thread Visualization Best Practices](https://material.io/design/components/lists.html#types)

---

This integration guide provides a foundation for implementing Gmail integration in the JobTracker CRM. After completing these steps, users will be able to manage their job search correspondence directly within the application, improving the tracking and organization of their communications with potential employers. 