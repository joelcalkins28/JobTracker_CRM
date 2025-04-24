import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { 
  updateCalendarEvent, 
  deleteCalendarEvent,
  formatApplicationEvent
} from 'app/lib/calendar';
import { prisma } from 'app/lib/prisma';
import { getCurrentUser } from 'app/lib/auth';

/**
 * GET /api/calendar/events/:id
 * Retrieves a specific calendar event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const userId = await getCurrentUser();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find the event in our database
    const eventRecord = await prisma.calendarEvent.findUnique({
      where: {
        id: params.id,
        userId
      },
      include: {
        application: true
      }
    });
    
    if (!eventRecord) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: eventRecord
    });
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch calendar event' 
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/calendar/events/:id
 * Updates a specific calendar event by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Find the event in our database
    const eventRecord = await prisma.calendarEvent.findUnique({
      where: {
        id: params.id,
        userId
      },
      include: {
        application: true
      }
    });
    
    if (!eventRecord) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { 
      eventType,
      startTime, 
      endTime, 
      location, 
      description 
    } = body;
    
    // Format updated event data
    const eventData = formatApplicationEvent(
      eventRecord.application,
      eventType || eventRecord.eventType,
      startTime ? new Date(startTime) : eventRecord.startTime,
      endTime ? new Date(endTime) : eventRecord.endTime,
      location,
      description
    );
    
    // Update the calendar event
    const updatedEvent = await updateCalendarEvent(
      token.accessToken as string,
      eventRecord.calendarEventId,
      eventData,
      eventRecord.calendarId
    );
    
    // Update our database record
    const updatedRecord = await prisma.calendarEvent.update({
      where: {
        id: params.id
      },
      data: {
        title: updatedEvent.summary as string,
        startTime: startTime ? new Date(startTime) : eventRecord.startTime,
        endTime: endTime ? new Date(endTime) : eventRecord.endTime,
        eventType: eventType || eventRecord.eventType,
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        event: updatedEvent,
        record: updatedRecord
      }
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update calendar event' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/events/:id
 * Deletes a specific calendar event by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Find the event in our database
    const eventRecord = await prisma.calendarEvent.findUnique({
      where: {
        id: params.id,
        userId
      }
    });
    
    if (!eventRecord) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Delete from Google Calendar
    await deleteCalendarEvent(
      token.accessToken as string,
      eventRecord.calendarEventId,
      eventRecord.calendarId
    );
    
    // Delete from our database
    await prisma.calendarEvent.delete({
      where: {
        id: params.id
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Calendar event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete calendar event' 
      },
      { status: 500 }
    );
  }
} 