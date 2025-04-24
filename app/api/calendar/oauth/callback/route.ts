import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getCalendarClient } from '@/lib/google';

/**
 * Handles the callback from Google OAuth for calendar integration
 * Processes the authorization code, retrieves tokens, and stores them
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    // Handle authorization errors
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL('/dashboard?error=google_auth_failed', request.url));
    }
    
    if (!code) {
      return NextResponse.redirect(new URL('/dashboard?error=missing_code', request.url));
    }
    
    // Verify the user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }
    
    // Initialize OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI
    );
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save tokens to the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        calendarConnected: true
      }
    });
    
    // Redirect to dashboard with success message
    return NextResponse.redirect(new URL('/dashboard?success=calendar_connected', request.url));
  } catch (error) {
    console.error('Google Calendar OAuth callback error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=google_calendar_auth_failed', request.url));
  }
} 