# API Route Testing Guide

This document outlines the process for testing all API routes in the JobTracker CRM application before deployment.

## Prerequisites

- Run the application from the correct directory: `cd jobtracker && npm run dev`
- Have a test user account created
- Have Postman, cURL, or another API testing tool ready

## Authentication Routes

### 1. Test User Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User", "email":"testuser@example.com", "password":"password123"}'
```
**Expected result**: 201 Created with user object (without password)

### 2. Test User Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com", "password":"password123"}'
```
**Expected result**: 200 OK with user object and token cookie set

### 3. Test Current User Info
```bash
# Use the cookie from the login response
curl -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: token=YOUR_TOKEN_FROM_LOGIN"
```
**Expected result**: 200 OK with current user's details

### 4. Test Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout
```
**Expected result**: 200 OK and token cookie cleared

## Job Application Routes

### 1. Test Creating a Job Application
```bash
curl -X POST http://localhost:3001/api/applications \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN_FROM_LOGIN" \
  -d '{"company":"Test Company", "position":"Software Engineer", "status":"APPLIED", "appliedDate":"2023-04-24"}'
```
**Expected result**: 201 Created with new application object

### 2. Test Getting All Applications
```bash
curl -X GET http://localhost:3001/api/applications \
  -H "Cookie: token=YOUR_TOKEN_FROM_LOGIN"
```
**Expected result**: 200 OK with array of applications

### 3. Test Getting a Single Application
```bash
curl -X GET http://localhost:3001/api/applications/APPLICATION_ID \
  -H "Cookie: token=YOUR_TOKEN_FROM_LOGIN"
```
**Expected result**: 200 OK with application details

### 4. Test Updating an Application
```bash
curl -X PUT http://localhost:3001/api/applications/APPLICATION_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN_FROM_LOGIN" \
  -d '{"status":"INTERVIEWING"}'
```
**Expected result**: 200 OK with updated application

### 5. Test Deleting an Application
```bash
curl -X DELETE http://localhost:3001/api/applications/APPLICATION_ID \
  -H "Cookie: token=YOUR_TOKEN_FROM_LOGIN"
```
**Expected result**: 200 OK with success message

## Calendar Routes

### 1. Test Creating a Calendar Event
```bash
curl -X POST http://localhost:3001/api/calendar/events \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN_FROM_LOGIN" \
  -d '{"applicationId":"APPLICATION_ID", "type":"INTERVIEW", "startDateTime":"2023-04-25T10:00:00Z", "endDateTime":"2023-04-25T11:00:00Z", "description":"Interview with HR"}'
```
**Expected result**: 201 Created with new event object

### 2. Test Getting Calendar Events
```bash
curl -X GET http://localhost:3001/api/calendar/events?applicationId=APPLICATION_ID \
  -H "Cookie: token=YOUR_TOKEN_FROM_LOGIN"
```
**Expected result**: 200 OK with array of events

### 3. Test Calendar Sync
```bash
curl -X POST http://localhost:3001/api/calendar/sync \
  -H "Cookie: token=YOUR_TOKEN_FROM_LOGIN"
```
**Expected result**: 200 OK with sync results

## Contacts Routes

### 1. Test Creating a Contact
```bash
curl -X POST http://localhost:3001/api/contacts \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN_FROM_LOGIN" \
  -d '{"name":"John Doe", "email":"john@example.com", "company":"Test Company", "position":"Hiring Manager", "notes":"Met at job fair"}'
```
**Expected result**: 201 Created with new contact object

### 2. Test Getting All Contacts
```bash
curl -X GET http://localhost:3001/api/contacts \
  -H "Cookie: token=YOUR_TOKEN_FROM_LOGIN"
```
**Expected result**: 200 OK with array of contacts

## Testing with Postman or Browser

For routes that are difficult to test with cURL:

1. Google OAuth: Navigate to `http://localhost:3001/auth/login` and click "Sign in with Google"
2. File uploads: Use Postman to test file upload endpoints
3. Complex queries: Use Postman for endpoints with complex query parameters

## Common Issues & Troubleshooting

1. **Authentication Errors**:
   - Ensure token cookie is being sent
   - Check that token is valid and not expired

2. **CORS Issues**:
   - Add appropriate headers for cross-origin requests
   - Check browser console for CORS errors

3. **Middleware Errors**:
   - Ensure middleware isn't blocking valid requests
   - Check console logs for middleware-related errors

4. **Database Errors**:
   - Verify connection string
   - Check that database schema matches expected models

## Automated Testing

For more comprehensive testing, run the test suite:

```bash
cd jobtracker
npm test
```

## Reporting Issues

 