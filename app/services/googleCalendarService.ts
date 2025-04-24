import { google, calendar_v3 } from 'googleapis';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import { cookies } from 'next/headers';

/**
 * Service for interacting with Google Calendar API
 */
export class GoogleCalendarService {
  private calendar: calendar_v3.Calendar;
  private userId: string;

  /**
   * Initialize the Google Calendar service with credentials
   * @param userId - Current user ID
   */
  constructor(userId: string) {
    this.userId = userId;
    
    try {
      // Create OAuth2 client using environment variables
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : 'http://localhost:3000/api/auth/callback/google'
      );
      
      // Initialize the calendar API
      this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    } catch (error) {
      console.error('Error initializing Google Calendar service:', error);
      throw new Error('Failed to initialize Google Calendar service');
    }
  }

  /**
   * Set OAuth tokens for authenticated requests
   * @param tokens - OAuth tokens
   */
  public setTokens(tokens: any): void {
    if (this.calendar.context && this.calendar.context._options && this.calendar.context._options.auth) {
      const auth = this.calendar.context._options.auth as any;
      if (typeof auth.setCredentials === 'function') {
        auth.setCredentials(tokens);
        return;
      }
    }
    throw new Error('OAuth client not properly initialized');
  }

  /**
   * Sync a local calendar event to Google Calendar
   * @param eventId - Local event ID to sync
   * @returns The created/updated Google Calendar event
   */
  public async syncEvent(eventId: string): Promise<calendar_v3.Schema$Event> {
    try {
      // Get user tokens from database
      const tokens = await this.getUserTokens();
      if (!tokens) {
        throw new Error('User not authenticated with Google');
      }
      
      this.setTokens(tokens);
      
      // Get the event from database
      const event = await prisma.calendarEvent.findUnique({
        where: { id: eventId },
        include: {
          jobApplication: true
        }
      });
      
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Check if event is already synced
      let googleEvent: calendar_v3.Schema$Event;
      
      if (event.googleCalendarEventId) {
        // Update existing event
        googleEvent = await this.calendar.events.update({
          calendarId: 'primary',
          eventId: event.googleCalendarEventId,
          requestBody: {
            summary: `${event.type}: ${event.jobApplication.company} - ${event.jobApplication.position}`,
            location: event.location || '',
            description: event.description || '',
            start: {
              dateTime: event.startDateTime.toISOString(),
              timeZone: 'UTC'
            },
            end: {
              dateTime: event.endDateTime.toISOString(),
              timeZone: 'UTC'
            }
          }
        }).then(res => res.data);
      } else {
        // Create new event
        googleEvent = await this.calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: `${event.type}: ${event.jobApplication.company} - ${event.jobApplication.position}`,
            location: event.location || '',
            description: event.description || '',
            start: {
              dateTime: event.startDateTime.toISOString(),
              timeZone: 'UTC'
            },
            end: {
              dateTime: event.endDateTime.toISOString(),
              timeZone: 'UTC'
            }
          }
        }).then(res => res.data);
        
        // Update local event with Google Calendar ID
        if (googleEvent.id) {
          await prisma.calendarEvent.update({
            where: { id: event.id },
            data: { 
              googleCalendarEventId: googleEvent.id,
              synced: true,
              syncedAt: new Date()
            }
          });
        }
      }
      
      return googleEvent;
    } catch (error) {
      console.error('Error syncing event to Google Calendar:', error);
      throw new Error('Failed to sync event with Google Calendar');
    }
  }

  /**
   * Delete an event from Google Calendar
   * @param eventId - Local event ID
   */
  public async deleteEvent(eventId: string): Promise<void> {
    try {
      // Get the event from database
      const event = await prisma.calendarEvent.findUnique({
        where: { id: eventId }
      });
      
      if (!event || !event.googleCalendarEventId) {
        return; // Nothing to delete from Google
      }
      
      // Get user tokens from database
      const tokens = await this.getUserTokens();
      if (!tokens) {
        throw new Error('User not authenticated with Google');
      }
      
      this.setTokens(tokens);
      
      // Delete from Google Calendar
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: event.googleCalendarEventId
      });
      
      // Update local event
      await prisma.calendarEvent.update({
        where: { id: eventId },
        data: { 
          googleCalendarEventId: null,
          synced: false,
          syncedAt: null
        }
      });
    } catch (error) {
      console.error('Error deleting event from Google Calendar:', error);
      throw new Error('Failed to delete event from Google Calendar');
    }
  }

  /**
   * Generate OAuth URL for user authentication
   * @returns Google OAuth URL
   */
  public generateAuthUrl(): string {
    try {
      const auth = this.calendar.context._options.auth as any;
      if (!auth || typeof auth.generateAuthUrl !== 'function') {
        throw new Error('OAuth client not properly initialized');
      }
      
      return auth.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
        prompt: 'consent' // Force to get refresh token
      });
    } catch (error) {
      console.error('Error generating auth URL:', error);
      throw new Error('Failed to generate Google authentication URL');
    }
  }

  /**
   * Get the current user's Google Calendar tokens
   * @returns OAuth tokens or null if not found
   */
  private async getUserTokens(): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: this.userId },
        select: { 
          googleRefreshToken: true,
          googleAccessToken: true,
          googleTokenExpiry: true
        }
      });
      
      if (!user || !user.googleRefreshToken) {
        return null;
      }
      
      // Check if token is expired and needs refresh
      const now = new Date();
      if (user.googleTokenExpiry && new Date(user.googleTokenExpiry) < now) {
        // Token is expired, refresh needed
        // Implementation depends on OAuth flow
        // This would typically call the token endpoint with the refresh token
        // For now, return existing tokens as a placeholder
      }
      
      return {
        refresh_token: user.googleRefreshToken,
        access_token: user.googleAccessToken,
        expiry_date: user.googleTokenExpiry?.getTime()
      };
    } catch (error) {
      console.error('Error retrieving user tokens:', error);
      return null;
    }
  }
} 