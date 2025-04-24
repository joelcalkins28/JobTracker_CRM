#!/bin/bash

# API Routes Testing Script
# This script tests all the API routes in the JobTracker CRM application

# Set the base URL
BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to test a route
test_route() {
  local method=$1
  local route=$2
  local expected_status=$3
  local data=$4
  local token=$5
  
  echo -e "${YELLOW}Testing $method $route${NC}"
  
  # Build the curl command
  cmd="curl -X $method -s -o /dev/null -w %{http_code} $BASE_URL$route"
  
  # Add data if provided
  if [ ! -z "$data" ]; then
    cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
  fi
  
  # Add token if provided
  if [ ! -z "$token" ]; then
    cmd="$cmd -H 'Cookie: token=$token'"
  fi
  
  # Execute the command
  result=$(eval $cmd)
  
  # Check the result
  if [ "$result" == "$expected_status" ]; then
    echo -e "${GREEN}✓ $method $route returned $result as expected${NC}"
  else
    echo -e "${RED}✗ $method $route returned $result, expected $expected_status${NC}"
  fi
  
  echo ""
}

# First, create a test user
echo -e "${YELLOW}Creating a test user...${NC}"
test_user_data='{"name":"Test User","email":"test@example.com","password":"password123"}'
test_route "POST" "/api/auth/register" "201" "$test_user_data"

# Login with the test user
echo -e "${YELLOW}Logging in with test user...${NC}"
login_data='{"email":"test@example.com","password":"password123"}'
login_response=$(curl -X POST -s \
  -H "Content-Type: application/json" \
  -d "$login_data" \
  -c - \
  $BASE_URL/api/auth/login)

# Extract the token from the login response
token=$(echo "$login_response" | grep token | awk '{print $7}')

if [ -z "$token" ]; then
  echo -e "${RED}Failed to get authentication token, cannot continue tests${NC}"
  exit 1
fi

echo -e "${GREEN}Got authentication token: $token${NC}"

# Test authenticated routes
test_route "GET" "/api/auth/me" "200" "" "$token"

# Test job application routes
test_route "POST" "/api/applications" "201" '{"company":"Test Company","position":"Software Engineer","status":"APPLIED","appliedDate":"2023-04-24"}' "$token"

# Get the application ID from the response
app_response=$(curl -X GET -s \
  -H "Cookie: token=$token" \
  $BASE_URL/api/applications)

app_id=$(echo "$app_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d':' -f2 | tr -d '"')

if [ ! -z "$app_id" ]; then
  echo -e "${GREEN}Got application ID: $app_id${NC}"
  
  # Test getting a single application
  test_route "GET" "/api/applications/$app_id" "200" "" "$token"
  
  # Test updating an application
  test_route "PUT" "/api/applications/$app_id" "200" '{"status":"INTERVIEWING"}' "$token"
  
  # Test calendar routes
  test_route "POST" "/api/calendar/events" "201" '{"applicationId":"'$app_id'","type":"INTERVIEW","startDateTime":"2023-04-25T10:00:00Z","endDateTime":"2023-04-25T11:00:00Z","description":"Interview with HR"}' "$token"
  
  # Test getting calendar events
  test_route "GET" "/api/calendar/events?applicationId=$app_id" "200" "" "$token"
else
  echo -e "${RED}Failed to get application ID, skipping related tests${NC}"
fi

# Test contact routes
test_route "POST" "/api/contacts" "201" '{"name":"John Doe","email":"john@example.com","company":"Test Company","position":"Hiring Manager","notes":"Met at job fair"}' "$token"
test_route "GET" "/api/contacts" "200" "" "$token"

# Clean up - delete the test user (optional)
# Note: This would require an API endpoint for user deletion

echo -e "${GREEN}API Route Testing Completed${NC}" 