import { google } from 'googleapis';

/**
 * Google OAuth2 client configuration
 * Used for authenticating with Google APIs
 */
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : 'http://localhost:3000/api/auth/callback/google'
);

/**
 * Generate a Google OAuth authorization URL
 * @param state - Optional state parameter for CSRF protection
 * @returns URL to redirect users for authentication
 */
export function getAuthUrl(state?: string) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    state: state,
    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.labels'
    ]
  });
}

/**
 * Initialize Google Calendar API client
 * @param accessToken - OAuth access token
 * @returns Google Calendar API client
 */
export function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  return google.calendar({ 
    version: 'v3', 
    auth 
  });
}

/**
 * Initialize Gmail API client
 * @param accessToken - OAuth access token
 * @returns Gmail API client
 */
export function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  
  return google.gmail({ 
    version: 'v1', 
    auth 
  });
} 