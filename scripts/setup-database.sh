#!/bin/bash

# Database Setup Script
# This script helps set up the PostgreSQL database for JobTracker CRM

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}JobTracker CRM Database Setup${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Error: Docker is not installed${NC}"
  echo "Please install Docker and Docker Compose: https://docs.docker.com/get-docker/"
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}Error: Docker Compose is not installed${NC}"
  echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
  exit 1
fi

# Start PostgreSQL with Docker Compose
echo -e "${YELLOW}Starting PostgreSQL with Docker Compose...${NC}"
docker-compose up -d postgres
echo -e "${GREEN}PostgreSQL container started${NC}"

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}Prisma client generated${NC}"

# Push schema to database
echo -e "${YELLOW}Pushing schema to database...${NC}"
npx prisma db push
echo -e "${GREEN}Schema pushed to database${NC}"

# Run migrations
echo -e "${YELLOW}Running migrations...${NC}"
npx prisma migrate dev --name init
echo -e "${GREEN}Migrations complete${NC}"

echo ""
echo -e "${GREEN}Database setup complete!${NC}"
echo ""
echo -e "${YELLOW}PostgreSQL connection details:${NC}"
echo "Host: localhost"
echo "Port: 5432"
echo "User: postgres"
echo "Password: postgres"
echo "Database: jobtracker"
echo ""
echo -e "${YELLOW}You can connect to the database with:${NC}"
echo "psql postgresql://postgres:postgres@localhost:5432/jobtracker"
echo ""
echo -e "${YELLOW}To stop the database:${NC}"
echo "docker-compose down"
echo "" 