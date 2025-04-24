# JobTracker CRM Changelog

## Calendar Events API (2023-11-16)

### Added
- Created new calendar events API endpoints at `/api/calendar/events` with the following operations:
  - `GET`: Retrieve calendar events for a specific job application
  - `POST`: Create a new calendar event
  - `PUT`: Update an existing calendar event
  - `DELETE`: Remove a calendar event

### Implementation Details
- All endpoints enforce authentication using the custom JWT-based auth system
- Events are associated with both users and job applications
- Proper validation ensures users can only access and modify their own events
- Error handling provides clear feedback for various failure conditions

### Database Schema Updates
- Updated CalendarEvent model in Prisma schema:
  - Made `calendarEventId` and `calendarId` optional for local events
  - Added `location` and `description` fields
  - Made `eventType` optional to accommodate different event types
  - Created proper relations to User and JobApplication models

### API Usage Examples

#### Create a new event
```typescript
// POST /api/calendar/events
const response = await fetch('/api/calendar/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Interview with HR',
    description: 'First round interview with HR department',
    startTime: '2023-11-20T14:00:00Z',
    endTime: '2023-11-20T15:00:00Z',
    applicationId: 'app-123',
    location: 'Zoom Meeting',
    type: 'interview'
  })
});
```

#### Get events for an application
```typescript
// GET /api/calendar/events?applicationId=app-123
const response = await fetch('/api/calendar/events?applicationId=app-123');
```

#### Update an event
```typescript
// PUT /api/calendar/events?id=event-123
const response = await fetch('/api/calendar/events?id=event-123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Updated Interview Title',
    startTime: '2023-11-20T15:00:00Z',
    endTime: '2023-11-20T16:00:00Z',
  })
});
```

#### Delete an event
```typescript
// DELETE /api/calendar/events?id=event-123
const response = await fetch('/api/calendar/events?id=event-123', {
  method: 'DELETE'
});
``` 