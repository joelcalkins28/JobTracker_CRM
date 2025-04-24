# Development Notes

## Calendar Events API Implementation (2023-11-16)

### Summary
We have successfully implemented a local Calendar Events API for the JobTracker CRM system. This API provides full CRUD functionality for managing calendar events related to job applications.

### Implementation Details

1. **API Endpoints**
   - GET: `/api/calendar/events?applicationId={id}` - Retrieve events for a specific application
   - POST: `/api/calendar/events` - Create a new calendar event
   - PUT: `/api/calendar/events?id={id}` - Update an existing event
   - DELETE: `/api/calendar/events?id={id}` - Remove an event

2. **Database Schema**
   - Updated the Prisma schema with a CalendarEvent model
   - Added proper relations to User and JobApplication models
   - Made Google Calendar-specific fields optional for local events

3. **Frontend Integration**
   - Updated the EventManager component to work with the new API
   - Fixed parameter naming between frontend and API

### Known Issues

1. **Development Server Issues**
   - We're encountering some dependency issues when starting the Next.js development server
   - Problematic modules include: @mapbox/node-pre-gyp, mock-aws-s3, fs-extra, fs.realpath
   - We've attempted to resolve these by:
     - Adding HTML loader for handling HTML files
     - Ignoring problematic node modules in webpack configuration
     - Installing missing dependencies
   - The server still fails to start consistently

2. **Database Integration**
   - The Prisma seed script has issues with TypeScript and paths
   - Currently, we cannot easily seed the database for testing

### Testing Instructions (2023-11-17)

1. **Important: Working Directory**
   - Always run commands from the `jobtracker` directory, not the parent `crm_test3` directory
   - Commands like `npm run dev` and `npx prisma studio` must be run from within `/jobtracker`

2. **Setting Up Test Data with Prisma Studio**
   - Start Prisma Studio: `cd jobtracker && npx prisma studio`
   - Access the web interface at: http://localhost:5555
   - Create test data in the following order:
     1. Create a User record
     2. Create a JobApplication record linked to the User
     3. Create CalendarEvent records linked to both the User and JobApplication

3. **Testing the API with Postman**
   - If the development server is running on port 3001: `http://localhost:3001/api/calendar/events`
   - Remember to include authentication (JWT token in the 'token' cookie)
   - Use the following request formats:

   **GET: Retrieve events for an application**
   ```
   GET http://localhost:3001/api/calendar/events?applicationId=YOUR_APP_ID
   ```

   **POST: Create a new event**
   ```
   POST http://localhost:3001/api/calendar/events
   Content-Type: application/json
   
   {
     "title": "Technical Interview",
     "description": "Second round technical interview",
     "startTime": "2023-11-25T14:00:00Z",
     "endTime": "2023-11-25T15:30:00Z",
     "applicationId": "YOUR_APP_ID",
     "location": "Google Meet",
     "type": "interview"
   }
   ```

   **PUT: Update an event**
   ```
   PUT http://localhost:3001/api/calendar/events?id=YOUR_EVENT_ID
   Content-Type: application/json
   
   {
     "title": "Updated Interview Title",
     "location": "Zoom Meeting Room 2"
   }
   ```

   **DELETE: Remove an event**
   ```
   DELETE http://localhost:3001/api/calendar/events?id=YOUR_EVENT_ID
   ```

4. **Verification**
   - After each API operation, refresh Prisma Studio to verify the database changes
   - Check the server logs for any errors or unexpected behavior

### Next Steps

1. **Google Calendar Integration**
   - Once local API is fully tested, proceed with Google Calendar integration
   - Use the existing lib/calendar.ts module to connect local events with Google Calendar
   - Implement synchronization between local and Google Calendar events

2. **Development Environment Solutions**
   - Consider using a containerized development environment (Docker)
   - Address Next.js server issues with a focused troubleshooting approach:
     - Try running without Turbopack: `npm run dev` (after updating package.json)
     - Consider downgrading problematic dependencies if necessary
     - Explore removing unnecessary dependencies from the build process
   - Consider setting up a minimal test environment separate from the main development server

3. **Documentation**
   - Complete comprehensive API documentation with all endpoints and parameters
   - Create usage examples for frontend components 

## Google Calendar Integration

We've implemented a bidirectional Google Calendar integration for the JobTracker CRM. This integration enables users to synchronize their job application events with Google Calendar for better tracking and notification management.

### Integration Scripts

Two scripts have been created to handle the bidirectional synchronization:

1. **Google Calendar Connector (`scripts/google-calendar-connector.js`)**
   - Pushes local calendar events to Google Calendar
   - Creates events in Google Calendar based on local job application events
   - Updates local events with Google Calendar IDs for future reference
   - Handles OAuth2 authentication with Google Calendar API

2. **Google Calendar Event Fetcher (`scripts/fetch-google-events.js`)**
   - Pulls events from Google Calendar to local database
   - Identifies job application events based on event metadata or content
   - Links Google Calendar events to appropriate job applications
   - Prevents duplication by checking existing events

### Setup and Usage

To use these scripts:

1. **Prerequisites**:
   - Google Cloud Platform account
   - OAuth 2.0 credentials for a web or desktop application
   - Node.js and npm installed

2. **Configuration**:
   - Place your `credentials.json` file in the `scripts` directory, or
   - Set the `GOOGLE_CREDENTIALS` environment variable with the JSON content of your credentials

3. **Running the scripts**:
   ```
   # To push local events to Google Calendar
   node scripts/google-calendar-connector.js <userId>
   
   # To fetch events from Google Calendar
   node scripts/fetch-google-events.js <userId>
   ```

4. **Authentication Flow**:
   - First-time usage will prompt for authentication via a browser
   - The script will provide a URL to visit
   - After granting permissions, you'll receive a code to enter back into the terminal
   - A token will be saved for future use

### Event Handling

Events are synchronized with the following considerations:

- **Local to Google**:
  - Events are formatted according to Google Calendar API requirements
  - Custom properties including application ID are stored in extended properties
  - Event types are determined based on the local event type

- **Google to Local**:
  - Application IDs are extracted from extended properties or event description
  - Event types are determined based on event title or extended properties
  - Only events with valid application IDs are imported
  - Duplicate events are skipped

### Future Enhancements

Planned improvements for the Google Calendar integration:

1. Create a web interface for configuration and manual synchronization
2. Implement automatic synchronization through scheduled jobs
3. Add support for different calendar colors based on event type
4. Enhance event matching logic to handle various Google Calendar event formats
5. Add support for calendar sharing and team collaboration features 

## Google Calendar Integration Testing (2023-11-18)

We've successfully implemented and tested the Google Calendar integration. Here's what we've accomplished:

### 1. Set Up Google Calendar API Access

- Configured real Google Cloud Platform credentials
- Updated scripts to handle both web and installed application credentials
- Created proper OAuth 2.0 authentication flow

### 2. Test Event Creation and Synchronization

- Created database test events for synchronization testing
- Implemented bidirectional synchronization:
  - Local events → Google Calendar
  - Google Calendar → Local database

### 3. Testing Results

When running `npm run sync-calendar -- <userId>`, the script:
1. Opens Google OAuth authentication flow
2. Retrieves user permission to access their calendar
3. Fetches local events from the database
4. Creates corresponding events in Google Calendar
5. Updates local events with Google Calendar IDs

When running `npm run fetch-calendar -- <userId>`, the script:
1. Retrieves events from Google Calendar
2. Matches them with local applications
3. Creates corresponding local events in the database

### Next Steps for the Integration

1. **Frontend Integration**:
   - Add a UI component for manually triggering synchronization
   - Display Google Calendar event links in the event manager component

2. **Automated Sync**:
   - Implement a cron job or background task for regular synchronization
   - Add webhooks for real-time updates between systems

3. **Enhanced Features**:
   - Support for calendar event notifications
   - Two-way edits synchronization 

## Google Calendar Frontend Integration (2023-11-20)

We've successfully implemented the frontend components needed for Google Calendar integration. Here's a summary of what's been accomplished:

### 1. Enhanced EventManager Component

- Added a "Sync with Google" button that allows users to manually synchronize their events
- Improved the UI to show Google Calendar status for each event with visual indicators
- Added direct links to events in Google Calendar when they've been synced
- Implemented loading and synchronization state indicators for better UX
- Added smart event title generation based on job application details

### 2. Synchronization API Endpoint

- Created a new API endpoint at `/api/calendar/sync` that:
  - Handles requests from the frontend to sync events
  - Communicates with Google Calendar API
  - Updates local events with Google Calendar IDs
  - Provides detailed status information for the sync operation
- Implemented proper error handling for all possible edge cases
- Used TypeScript for type safety throughout the implementation

### 3. UI Components

- Created a Tooltip component to improve user experience
- Added success/error notifications for all calendar operations
- Enhanced event display to show sync status and Google Calendar links

### Frontend Usage

The calendar integration can now be used directly from the frontend:

1. Create events through the EventManager component
2. Click the "Sync with Google" button to push events to Google Calendar
3. Events will show a Google Calendar badge when synchronized
4. Click "View in Google Calendar" to open the event in Google Calendar

These frontend enhancements complete our Google Calendar integration, creating a seamless experience for users to manage their job application events.

### Next Steps

1. **Automated Synchronization**:
   - Implement background sync jobs to automatically keep calendars in sync
   - Add webhooks for real-time updates when events change in Google Calendar

2. **User Settings**:
   - Create a settings page where users can configure calendar preferences
   - Add options for automatic synchronization frequency 