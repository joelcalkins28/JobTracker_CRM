/**
 * Google Calendar Event Fetcher
 * This script fetches events from Google Calendar and saves them locally.
 * It demonstrates how to:
 * 1. Connect to Google Calendar API
 * 2. Fetch events for a specified time range
 * 3. Link events to job applications based on event properties
 * 4. Save events to the local database
 */

// Import required dependencies
const { PrismaClient } = require('../app/generated/prisma');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Initialize Prisma client
const prisma = new PrismaClient();

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Google Calendar API configuration
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

/**
 * Get OAuth2 client for Google API
 * @returns {Promise<google.auth.OAuth2>} Authentication client
 */
async function getAuthClient() {
  try {
    // Load client credentials
    const credentials = process.env.GOOGLE_CREDENTIALS 
      ? JSON.parse(process.env.GOOGLE_CREDENTIALS) 
      : JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

    // Handle both web and installed application credentials
    const config = credentials.web || credentials.installed;
    if (!config) {
      throw new Error('Invalid credentials format: neither web nor installed configuration found');
    }

    const { client_secret, client_id, redirect_uris } = config;
    const redirectUri = redirect_uris[0] || 'http://localhost';
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

    try {
      // Try to load existing token
      const token = process.env.GOOGLE_TOKEN 
        ? JSON.parse(process.env.GOOGLE_TOKEN) 
        : JSON.parse(fs.readFileSync(TOKEN_PATH));
      
      oAuth2Client.setCredentials(token);
      return oAuth2Client;
    } catch (error) {
      // If token doesn't exist or is invalid, get a new one
      return await getAccessToken(oAuth2Client);
    }
  } catch (error) {
    console.error('Error loading credentials:', error);
    throw new Error('Failed to get authentication client');
  }
}

/**
 * Get a new access token
 * @param {google.auth.OAuth2} oAuth2Client - The OAuth2 client
 * @returns {Promise<google.auth.OAuth2>} Authenticated client
 */
async function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this URL:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        // Save token for future use
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log('Token stored to', TOKEN_PATH);
        
        resolve(oAuth2Client);
      } catch (error) {
        reject(new Error(`Error retrieving access token: ${error.message}`));
      }
    });
  });
}

/**
 * Initialize Google Calendar API
 * @param {google.auth.OAuth2} auth - Authentication client
 * @returns {google.calendar_v3.Calendar} Calendar API client
 */
function getCalendarClient(auth) {
  return google.calendar({ version: 'v3', auth });
}

/**
 * Extract application ID from Google Calendar event
 * @param {Object} event - Google Calendar event
 * @returns {string|null} Application ID or null if not found
 */
function extractApplicationId(event) {
  const extendedProps = event.extendedProperties?.private;
  
  if (extendedProps?.applicationId) {
    return extendedProps.applicationId;
  }
  
  // Try to extract from event title or description
  const title = event.summary || '';
  const description = event.description || '';
  
  // Look for application ID format in description
  const appIdMatch = description.match(/applicationId[:=]\s*([a-zA-Z0-9-_]+)/);
  if (appIdMatch && appIdMatch[1]) {
    return appIdMatch[1];
  }
  
  // No application ID found
  return null;
}

/**
 * Determine event type from Google Calendar event
 * @param {Object} event - Google Calendar event
 * @returns {string} Event type
 */
function determineEventType(event) {
  const extendedProps = event.extendedProperties?.private;
  
  if (extendedProps?.eventType) {
    return extendedProps.eventType;
  }
  
  // Try to determine from title
  const title = (event.summary || '').toLowerCase();
  
  if (title.includes('interview')) return 'interview';
  if (title.includes('follow') && title.includes('up')) return 'follow-up';
  if (title.includes('deadline')) return 'deadline';
  if (title.includes('phone') || title.includes('call')) return 'phone screen';
  if (title.includes('technical')) return 'technical';
  if (title.includes('offer')) return 'offer';
  
  return 'other';
}

/**
 * Fetch events from Google Calendar and save to local database
 * @param {Object} options - Options for fetching events
 * @param {number} options.days - Number of days to fetch, default 30
 * @param {string} options.userId - User ID to associate events with
 */
async function fetchEvents({ days = 30, userId } = {}) {
  if (!userId) {
    console.error('User ID is required');
    return;
  }
  
  try {
    // Get authentication client
    const auth = await getAuthClient();
    const calendar = getCalendarClient(auth);
    
    // Calculate time range
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + days);
    
    console.log(`Fetching events from ${timeMin.toISOString()} to ${timeMax.toISOString()}`);
    
    // Get primary calendar
    const calendarRes = await calendar.calendarList.list();
    const primaryCalendar = calendarRes.data.items?.find(cal => cal.primary);
    const calendarId = primaryCalendar?.id || 'primary';
    
    // Fetch events
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items || [];
    console.log(`Found ${events.length} events in Google Calendar`);
    
    // Process each event
    for (const event of events) {
      // Skip events that don't have start/end times
      if (!event.start?.dateTime || !event.end?.dateTime) {
        console.log(`Skipping event without start/end time: ${event.summary}`);
        continue;
      }
      
      // Check if this event is already in our database
      const existingEvent = await prisma.calendarEvent.findFirst({
        where: { calendarEventId: event.id }
      });
      
      if (existingEvent) {
        console.log(`Event already exists locally: ${event.summary}`);
        continue;
      }
      
      // Extract application ID
      const applicationId = extractApplicationId(event);
      if (!applicationId) {
        console.log(`No application ID found for event: ${event.summary}`);
        continue;
      }
      
      // Check if the application exists
      const application = await prisma.jobApplication.findFirst({
        where: { id: applicationId }
      });
      
      if (!application) {
        console.log(`Application not found for ID: ${applicationId}`);
        continue;
      }
      
      // Determine event type
      const eventType = determineEventType(event);
      
      // Create local calendar event
      try {
        const localEvent = await prisma.calendarEvent.create({
          data: {
            title: event.summary,
            description: event.description || '',
            location: event.location || '',
            startTime: new Date(event.start.dateTime),
            endTime: new Date(event.end.dateTime),
            eventType,
            calendarEventId: event.id,
            calendarId,
            userId,
            applicationId,
          }
        });
        
        console.log(`Created local event: ${localEvent.title}`);
      } catch (error) {
        console.error(`Error creating local event for ${event.summary}:`, error.message);
      }
    }
    
    console.log('Import completed');
  } catch (error) {
    console.error('Error in event fetching:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get user ID from command line arguments
const args = process.argv.slice(2);
const userId = args[0];

if (!userId) {
  console.error('Usage: node fetch-google-events.js <userId>');
  process.exit(1);
}

// Run the import process
fetchEvents({ userId }).then(() => {
  console.log('Script execution completed');
}).catch(error => {
  console.error('Script execution failed:', error);
}); 