import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from 'app/lib/google';
import { getCurrentUser } from 'app/lib/auth';
import prisma from 'app/lib/prisma';
import { google } from 'googleapis';

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/oauth/callback';

/**
 * Initiates Google OAuth authorization flow
 * Redirects the user to Google's consent page
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate the authorization URL with appropriate scopes
    const authUrl = getAuthUrl();

    // Store the user ID in the session to retrieve after callback
    // In a production app, you would use a proper session or store a state token
    const userId = user.id;
    
    return NextResponse.json({
      authUrl,
      userId
    });
  } catch (error) {
    console.error('OAuth initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize OAuth flow' },
      { status: 500 }
    );
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