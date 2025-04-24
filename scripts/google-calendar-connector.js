/**
 * Google Calendar Connector Script
 * This script helps test the integration between local calendar events and Google Calendar.
 * It demonstrates how to:
 * 1. Fetch local events from the database
 * 2. Format them for Google Calendar
 * 3. Push them to Google Calendar
 * 4. Update the local events with Google Calendar IDs
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
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
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
 * Format application event for Google Calendar
 * @param {Object} event - Local calendar event
 * @param {Object} application - Associated job application
 * @returns {Object} Formatted Google Calendar event
 */
function formatApplicationEvent(event, application) {
  const eventType = event.eventType || 'appointment';
  
  // Construct event title based on event type if not provided
  let eventTitle = event.title;
  if (!eventTitle) {
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
  }
  
  // Create default description if none provided
  let description = event.description || '';
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
    location: event.location || '',
    description: description,
    start: {
      dateTime: event.startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.endTime.toISOString(),
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
        localEventId: event.id
      },
    },
  };
}

/**
 * Synchronize local calendar events with Google Calendar
 */
async function syncEvents() {
  try {
    // Get authentication client
    const auth = await getAuthClient();
    const calendar = getCalendarClient(auth);
    
    // Get primary calendar ID
    const calendarRes = await calendar.calendarList.list();
    const primaryCalendar = calendarRes.data.items?.find(cal => cal.primary);
    const calendarId = primaryCalendar?.id || 'primary';
    
    console.log(`Using calendar: ${calendarId}`);
    
    // Fetch local events that don't have a Google Calendar ID
    const localEvents = await prisma.calendarEvent.findMany({
      where: {
        calendarEventId: null
      },
      include: {
        application: true
      }
    });
    
    console.log(`Found ${localEvents.length} local events to sync`);
    
    // Process each event
    for (const event of localEvents) {
      try {
        // Format for Google Calendar
        const googleEvent = formatApplicationEvent(event, event.application);
        
        // Create event in Google Calendar
        const res = await calendar.events.insert({
          calendarId,
          requestBody: googleEvent,
        });
        
        console.log(`Event created: ${res.data.htmlLink}`);
        
        // Update local event with Google Calendar ID
        await prisma.calendarEvent.update({
          where: { id: event.id },
          data: {
            calendarEventId: res.data.id,
            calendarId
          }
        });
        
        console.log(`Local event ${event.id} updated with Google Calendar ID ${res.data.id}`);
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error.message);
      }
    }
    
    console.log('Sync completed');
  } catch (error) {
    console.error('Error in synchronization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync process
syncEvents().then(() => {
  console.log('Script execution completed');
}).catch(error => {
  console.error('Script execution failed:', error);
}); 