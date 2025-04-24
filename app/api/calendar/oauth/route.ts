import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getCurrentUser } from '@/lib/auth';

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/oauth/callback';

/**
 * Initiates the Google OAuth flow for calendar integration
 * Redirects the user to Google's authorization page
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }
    
    // Initialize OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI
    );
    
    // Generate authorization URL with required scopes
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force to show the consent screen to get refresh_token
    });
    
    // Redirect to Google's authorization page
    return NextResponse.redirect(new URL(authUrl));
  } catch (error) {
    console.error('Google Calendar OAuth authorization error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=google_auth_init_failed', request.url));
  }
}

/**
 * Handles OAuth callback from Google
 * Stores the access token in the database associated with the user
 */
export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Configure OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Save tokens to the database
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Google Calendar successfully connected'
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Failed to complete OAuth process' },
      { status: 500 }
    );
  }
}

/**
 * Revokes Google OAuth access and clears tokens from the database
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only proceed if user has a Google token
    if (!user.googleAccessToken) {
      return NextResponse.json(
        { error: 'No Google account connected' },
        { status: 400 }
      );
    }

    // Configure OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );
    
    // Set credentials
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken
    });

    // Revoke token (best effort)
    try {
      await oauth2Client.revokeToken(user.googleAccessToken);
    } catch (revokeError) {
      console.warn('Token revocation failed, proceeding with local cleanup:', revokeError);
    }

    // Remove tokens from database regardless of revocation result
    await prisma.user.update({
      where: { id: user.id },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Google Calendar disconnected successfully'
    });
  } catch (error) {
    console.error('OAuth revocation error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    );
  }
} 