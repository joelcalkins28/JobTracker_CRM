import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from 'app/lib/auth';
import { prisma } from 'app/lib/prisma';

/**
 * GET handler to fetch calendar events for a specific job application
 * @param req - The incoming request object
 * @returns - Calendar events data or error response
 */
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the application ID from the request URL
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Check if the application belongs to the user
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Fetch the calendar events for this application
    const events = await prisma.calendarEvent.findMany({
      where: {
        applicationId,
        userId,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create a new calendar event
 * @param req - The incoming request object
 * @returns - The created calendar event or error response
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();
    
    // Validate required fields
    const { applicationId, title, startTime, endTime } = body;
    
    if (!applicationId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, title, startTime, endTime' },
        { status: 400 }
      );
    }

    // Check if the application belongs to the user
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Create the new calendar event
    const newEvent = await prisma.calendarEvent.create({
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        eventType: body.eventType,
        location: body.location,
        description: body.description,
        calendarEventId: body.calendarEventId,
        calendarId: body.calendarId,
        user: {
          connect: { id: userId },
        },
        application: {
          connect: { id: applicationId },
        },
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a calendar event
 * @param {NextRequest} req - The incoming request
 * @returns {NextResponse} Response confirming deletion or error
 */
export async function DELETE(req: NextRequest) {
  try {
    // Verify user is authenticated
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get event ID from URL
    const url = new URL(req.url);
    const eventId = url.searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Find the event and ensure it belongs to the user
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id: eventId,
        userId: userId
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the event
    await prisma.calendarEvent.delete({
      where: {
        id: eventId
      }
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update an existing calendar event
 * @param {NextRequest} req - The incoming request
 * @returns {NextResponse} Response containing the updated event or error
 */
export async function PUT(req: NextRequest) {
  try {
    // Verify user is authenticated
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get event ID from URL
    const url = new URL(req.url);
    const eventId = url.searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Parse request body
    const body = await req.json();
    const { title, description, startTime, endTime, location, type } = body;

    // Find the event and ensure it belongs to the user
    const existingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: eventId,
        userId: userId
      }
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found or access denied' },
        { status: 404 }
      );
    }

    // Update the event
    const updatedEvent = await prisma.calendarEvent.update({
      where: {
        id: eventId
      },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(location !== undefined && { location }),
        ...(type && { eventType: type })
      }
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
} 