import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { 
  getCalendarEvents, 
  getPrimaryCalendarId 
} from 'app/lib/calendar';
import { prisma } from 'app/lib/prisma';
import { getCurrentUser } from 'app/lib/auth';

/**
 * GET /api/calendar
 * Retrieves calendar events for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getCurrentUser();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get token from session
    const token = await getToken({ req: request });
    
    if (!token?.accessToken) {
      return NextResponse.json(
        { error: 'No access token found. Please reconnect your Google Calendar.' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin') ? new Date(searchParams.get('timeMin') as string) : new Date();
    const timeMax = searchParams.get('timeMax') 
      ? new Date(searchParams.get('timeMax') as string) 
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    const maxResults = searchParams.get('maxResults') ? parseInt(searchParams.get('maxResults') as string) : 10;
    
    // Get calendar ID (use primary if not specified)
    const calendarId = searchParams.get('calendarId') || await getPrimaryCalendarId(token.accessToken as string);
    
    // Fetch calendar events
    const events = await getCalendarEvents(
      token.accessToken as string,
      calendarId,
      timeMin,
      timeMax,
      maxResults
    );
    
    return NextResponse.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch calendar events' 
      },
      { status: 500 }
    );
  }
} 