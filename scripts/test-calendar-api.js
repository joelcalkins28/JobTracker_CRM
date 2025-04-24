/**
 * Direct Database Testing Script for Calendar Events API
 * This script bypasses the API layer and directly interacts with the database
 * to test the Calendar Events functionality.
 */

// Import Prisma client from the generated location
const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Create a test user if one doesn't exist
 * @returns {Promise<Object>} The user object
 */
async function ensureTestUser() {
  const email = 'test@example.com';
  
  let user = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!user) {
    // Create test user
    user = await prisma.user.create({
      data: {
        email,
        name: 'Test User',
        password: 'password123', // In a real application, this would be hashed
      }
    });
    console.log('Created test user:', user.id);
  } else {
    console.log('Using existing user:', user.id);
  }
  
  return user;
}

/**
 * Create a test job application if one doesn't exist
 * @param {string} userId - The user ID to associate with the application
 * @returns {Promise<Object>} The job application object
 */
async function ensureTestApplication(userId) {
  let application = await prisma.jobApplication.findFirst({
    where: { userId }
  });
  
  if (!application) {
    // Create test application
    application = await prisma.jobApplication.create({
      data: {
        jobTitle: 'Software Engineer',
        company: 'Test Company',
        location: 'Remote',
        status: 'Applied',
        userId,
      }
    });
    console.log('Created test application:', application.id);
  } else {
    console.log('Using existing application:', application.id);
  }
  
  return application;
}

/**
 * Create a test calendar event
 * @param {string} userId - The user ID to associate with the event
 * @param {string} applicationId - The application ID to associate with the event
 * @returns {Promise<Object>} The created calendar event
 */
async function createCalendarEvent(userId, applicationId) {
  // Create test event
  const event = await prisma.calendarEvent.create({
    data: {
      title: 'Technical Interview',
      description: 'Second round technical interview',
      startTime: new Date(Date.now() + 86400000), // Tomorrow
      endTime: new Date(Date.now() + 86400000 + 3600000), // Tomorrow + 1 hour
      eventType: 'interview',
      location: 'Google Meet',
      userId,
      applicationId,
    }
  });
  
  console.log('Created calendar event:', event.id);
  return event;
}

/**
 * Fetch calendar events for an application
 * @param {string} applicationId - The application ID to fetch events for
 * @returns {Promise<Array>} The calendar events
 */
async function fetchCalendarEvents(applicationId) {
  const events = await prisma.calendarEvent.findMany({
    where: { applicationId },
    orderBy: { startTime: 'asc' }
  });
  
  console.log(`Fetched ${events.length} events for application ${applicationId}`);
  return events;
}

/**
 * Update a calendar event
 * @param {string} eventId - The event ID to update
 * @returns {Promise<Object>} The updated calendar event
 */
async function updateCalendarEvent(eventId) {
  const updatedEvent = await prisma.calendarEvent.update({
    where: { id: eventId },
    data: {
      title: 'Updated Interview',
      description: 'This event has been updated via direct database access',
    }
  });
  
  console.log(`Updated event ${eventId}:`, updatedEvent.title);
  return updatedEvent;
}

/**
 * Delete a calendar event
 * @param {string} eventId - The event ID to delete
 * @returns {Promise<Object>} The deleted calendar event
 */
async function deleteCalendarEvent(eventId) {
  const deletedEvent = await prisma.calendarEvent.delete({
    where: { id: eventId }
  });
  
  console.log(`Deleted event ${eventId}`);
  return deletedEvent;
}

/**
 * Run the test script
 */
async function runTest() {
  try {
    console.log('Starting Calendar Events API direct database test...');
    
    // Ensure test user exists
    const user = await ensureTestUser();
    
    // Ensure test application exists
    const application = await ensureTestApplication(user.id);
    
    // Step 1: Create event
    console.log('\n=== STEP 1: CREATING EVENT ===');
    const newEvent = await createCalendarEvent(user.id, application.id);
    
    // Step 2: Fetch events
    console.log('\n=== STEP 2: FETCHING EVENTS ===');
    const events = await fetchCalendarEvents(application.id);
    console.log('Events:', events.map(e => ({ id: e.id, title: e.title })));
    
    // Step 3: Update event
    console.log('\n=== STEP 3: UPDATING EVENT ===');
    const updatedEvent = await updateCalendarEvent(newEvent.id);
    
    // Step 4: Fetch updated events
    console.log('\n=== STEP 4: FETCHING UPDATED EVENTS ===');
    const updatedEvents = await fetchCalendarEvents(application.id);
    console.log('Updated events:', updatedEvents.map(e => ({ id: e.id, title: e.title })));
    
    // Step 5: Delete event
    console.log('\n=== STEP 5: DELETING EVENT ===');
    await deleteCalendarEvent(newEvent.id);
    
    // Step 6: Confirm deletion
    console.log('\n=== STEP 6: CONFIRMING DELETION ===');
    const finalEvents = await fetchCalendarEvents(application.id);
    console.log('Final events count:', finalEvents.length);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
runTest(); 