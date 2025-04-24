import { NextRequest } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { getCalendarClient } from '@/app/lib/google';
import { apiSuccess, apiError } from '@/app/lib/utils/api';

/**
 * Type for calendar event with application
 */
interface CalendarEventWithApplication {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startTime: Date;
  endTime: Date;
  applicationId: string;
  application: {
    jobTitle: string;
    company: string;
  };
}

/**
 * POST handler to sync calendar events with Google Calendar
 * Syncs all events belonging to the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user from token
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return apiError('Unauthorized', 401);
    }
    
    const decodedToken = verifyToken(token);
    
    if (!decodedToken || !decodedToken.id) {
      return apiError('Unauthorized', 401);
    }
    
    const userId = decodedToken.id;
    
    // Get Google account
    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: 'google',
      },
    });
    
    if (!googleAccount || !googleAccount.access_token) {
      return apiError('Google account not connected or missing access token', 400);
    }
    
    // Get calendar events that don't have a Google Calendar ID yet
    const localEvents = await prisma.calendarEvent.findMany({
      where: {
        userId: userId,
        calendarEventId: null, // No Google Calendar ID means not synced yet
      },
      include: {
        application: true,
      },
    });
    
    // Initialize Google Calendar client
    const calendarClient = getCalendarClient(googleAccount.access_token);
    
    // Sync each event
    const syncResults = await Promise.allSettled(
      localEvents.map(async (event: CalendarEventWithApplication) => {
        // Create event in Google Calendar
        const googleEvent = await calendarClient.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: event.title,
            description: event.description || '',
            location: event.location || '',
            start: {
              dateTime: event.startTime.toISOString(),
              timeZone: 'UTC',
            },
            end: {
              dateTime: event.endTime.toISOString(),
              timeZone: 'UTC',
            },
            extendedProperties: {
              private: {
                applicationId: event.applicationId,
                jobTitle: event.application.jobTitle,
                company: event.application.company,
              },
            },
          },
        });
        
        // Update local event with Google Calendar ID
        if (googleEvent.data.id) {
          await prisma.calendarEvent.update({
            where: { id: event.id },
            data: {
              calendarEventId: googleEvent.data.id,
              calendarId: 'primary',
            },
          });
        }
        
        return {
          eventId: event.id,
          googleEventId: googleEvent.data.id,
          title: event.title,
        };
      })
    );
    
    // Count successful syncs
    const successful = syncResults.filter((result) => result.status === 'fulfilled').length;
    const failed = syncResults.filter((result) => result.status === 'rejected').length;
    
    // Log the sync operation
    await prisma.syncLog.create({
      data: {
        userId: userId,
        service: 'calendar',
        details: `Synced ${successful} events successfully, ${failed} failed`,
        success: successful > 0 || failed === 0,
      },
    });
    
    return apiSuccess({
      message: 'Calendar events synchronized with Google Calendar',
      synced: successful,
      failed: failed,
      total: localEvents.length,
    });
  } catch (error) {
    console.error('Error syncing calendar events:', error);
    
    // Log failed sync attempt
    try {
      const userId = request.cookies.get('token')
        ? verifyToken(request.cookies.get('token')?.value || '')?.id
        : null;
        
      if (userId) {
        await prisma.syncLog.create({
          data: {
            userId: userId,
            service: 'calendar',
            details: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            success: false,
          },
        });
      }
    } catch (logError) {
      console.error('Error logging sync failure:', logError);
    }
    
    return apiError('Failed to sync calendar events', 500);
  }
} 