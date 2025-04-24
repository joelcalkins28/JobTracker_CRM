import { google, calendar_v3 } from 'googleapis';
import { getSession } from 'next-auth/react';
import { prisma } from './prisma';

/**
 * Initialize the Google Calendar API client
 * @param token OAuth access token
 * @returns Google Calendar API client
 */
export function getCalendarClient(token: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  oauth2Client.setCredentials({
    access_token: token
  });
  
  return google.calendar({
    version: 'v3',
    auth: oauth2Client
  });
}

/**
 * Get user's calendar list
 * @param token OAuth access token
 * @returns List of user's calendars
 */
export async function getCalendarList(token: string) {
  try {
    const calendar = getCalendarClient(token);
    const response = await calendar.calendarList.list();
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    throw error;
  }
}

/**
 * Get user's primary calendar ID
 * @param token OAuth access token
 * @returns Primary calendar ID
 */
export async function getPrimaryCalendarId(token: string) {
  try {
    const calendar = getCalendarClient(token);
    const response = await calendar.calendarList.list();
    const primaryCalendar = response.data.items?.find(cal => cal.primary);
    return primaryCalendar?.id || 'primary';
  } catch (error) {
    console.error('Error fetching primary calendar:', error);
    return 'primary'; // Default to 'primary' if there's an error
  }
}

/**
 * Get events from a calendar
 * @param token OAuth access token
 * @param calendarId Calendar ID (defaults to primary)
 * @param timeMin Start time for events (defaults to now)
 * @param timeMax End time for events (defaults to 30 days from now)
 * @param maxResults Maximum number of events to fetch (defaults to 10)
 * @returns List of calendar events
 */
export async function getCalendarEvents(
  token: string,
  calendarId: string = 'primary',
  timeMin: Date = new Date(),
  timeMax: Date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  maxResults: number = 10
) {
  try {
    const calendar = getCalendarClient(token);
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

/**
 * Format application data into a calendar event
 * @param application The job application data
 * @param eventType Type of event (interview, application deadline, etc.)
 * @param startTime Event start time
 * @param endTime Event end time (defaults to 1 hour after start time)
 * @returns Calendar event resource
 */
export function formatApplicationEvent(
  application: any,
  eventType: string,
  startTime: Date,
  endTime: Date = new Date(startTime.getTime() + 60 * 60 * 1000), // Default to 1 hour
  location: string = '',
  description: string = ''
): calendar_v3.Schema$Event {
  // Construct event title based on event type
  let eventTitle = '';
  
  switch (eventType.toLowerCase()) {
    case 'interview':
      eventTitle = `Interview: ${application.company} - ${application.jobTitle}`;
      break;
    case 'follow-up':
      eventTitle = `Follow-up: ${application.company} - ${application.jobTitle}`;
      break;
    case 'deadline':
      eventTitle = `Application Deadline: ${application.company} - ${application.jobTitle}`;
      break;
    default:
      eventTitle = `${eventType}: ${application.company} - ${application.jobTitle}`;
  }
  
  // Create default description if none provided
  if (!description) {
    description = `Job application: ${application.jobTitle} at ${application.company}\n\n`;
    
    if (application.location) {
      description += `Location: ${application.location}\n`;
    }
    
    if (application.status) {
      description += `Status: ${application.status}\n`;
    }
    
    if (application.applicationUrl) {
      description += `Job posting: ${application.applicationUrl}\n`;
    }
    
    description += `\nManage this application in JobTracker CRM`;
  }
  
  return {
    summary: eventTitle,
    location: location,
    description: description,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day email reminder
        { method: 'popup', minutes: 30 }, // 30 minute popup reminder
      ],
    },
    // Store application ID for reference
    extendedProperties: {
      private: {
        applicationId: application.id,
        eventType: eventType,
        source: 'jobtracker-crm',
      },
    },
  };
}

/**
 * Create a calendar event
 * @param token OAuth access token
 * @param event Calendar event resource
 * @param calendarId Calendar ID (defaults to primary)
 * @returns Created event
 */
export async function createCalendarEvent(
  token: string,
  event: calendar_v3.Schema$Event,
  calendarId: string = 'primary'
) {
  try {
    const calendar = getCalendarClient(token);
    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

/**
 * Update a calendar event
 * @param token OAuth access token
 * @param eventId Event ID
 * @param event Updated event data
 * @param calendarId Calendar ID (defaults to primary)
 * @returns Updated event
 */
export async function updateCalendarEvent(
  token: string,
  eventId: string,
  event: calendar_v3.Schema$Event,
  calendarId: string = 'primary'
) {
  try {
    const calendar = getCalendarClient(token);
    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

/**
 * Delete a calendar event
 * @param token OAuth access token
 * @param eventId Event ID
 * @param calendarId Calendar ID (defaults to primary)
 */
export async function deleteCalendarEvent(
  token: string,
  eventId: string,
  calendarId: string = 'primary'
) {
  try {
    const calendar = getCalendarClient(token);
    await calendar.events.delete({
      calendarId,
      eventId,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}

/**
 * Get calendar events for a specific application
 * @param token OAuth access token
 * @param applicationId Application ID
 * @param calendarId Calendar ID (defaults to primary)
 * @returns List of events associated with the application
 */
export async function getEventsForApplication(
  token: string,
  applicationId: string,
  calendarId: string = 'primary'
) {
  try {
    const calendar = getCalendarClient(token);
    const response = await calendar.events.list({
      calendarId,
      privateExtendedProperty: `applicationId=${applicationId}`,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching events for application:', error);
    throw error;
  }
} 