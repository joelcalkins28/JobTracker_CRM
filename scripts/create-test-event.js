/**
 * Create test calendar events for the Google Calendar integration test
 */

// Import Prisma client from the generated location
const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuration
const userId = '395d9d2a-b9c6-4e7a-a42e-1a5e982e5134';
const applicationId = 'ad23743e-7970-43fd-b2a8-3ca510a5babc';

/**
 * Create a test calendar event
 */
async function createTestEvents() {
  try {
    console.log('Creating test calendar events...');
    
    // Create an interview event
    const interview = await prisma.calendarEvent.create({
      data: {
        title: 'First Interview',
        description: 'Initial interview with the hiring manager',
        startTime: new Date(Date.now() + 86400000), // Tomorrow
        endTime: new Date(Date.now() + 86400000 + 3600000), // Tomorrow + 1 hour
        eventType: 'interview',
        location: 'Google Meet',
        userId,
        applicationId,
      }
    });
    console.log('Created interview event:', interview.id);
    
    // Create a technical assessment event
    const techAssessment = await prisma.calendarEvent.create({
      data: {
        title: 'Technical Assessment',
        description: 'Complete a coding challenge within a 2-hour window',
        startTime: new Date(Date.now() + 172800000), // 2 days from now
        endTime: new Date(Date.now() + 172800000 + 7200000), // 2 days from now + 2 hours
        eventType: 'technical',
        location: 'Online',
        userId,
        applicationId,
      }
    });
    console.log('Created technical assessment event:', techAssessment.id);
    
    // Create a follow-up event
    const followUp = await prisma.calendarEvent.create({
      data: {
        title: 'Follow-up Call',
        description: 'Quick follow-up call to discuss next steps',
        startTime: new Date(Date.now() + 259200000), // 3 days from now
        endTime: new Date(Date.now() + 259200000 + 1800000), // 3 days from now + 30 minutes
        eventType: 'follow-up',
        location: 'Phone',
        userId,
        applicationId,
      }
    });
    console.log('Created follow-up event:', followUp.id);
    
    console.log('\nAll test events created successfully!');
    console.log('\nRun the Google Calendar sync script with:');
    console.log(`npm run sync-calendar -- ${userId}`);
  } catch (error) {
    console.error('Error creating test events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestEvents(); 