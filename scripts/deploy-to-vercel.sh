#!/bin/bash

# Deployment to Vercel Script
# This script helps deploy the JobTracker CRM application to Vercel

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}JobTracker CRM Deployment Preparation${NC}"
echo -e "This script will help prepare your application for deployment to Vercel."
echo ""

# Check if Git is initialized
if [ ! -d ".git" ]; then
  echo -e "${YELLOW}Initializing Git repository...${NC}"
  git init
fi

# Create a .gitignore file if it doesn't exist
if [ ! -f ".gitignore" ]; then
  echo -e "${YELLOW}Creating .gitignore file...${NC}"
  cat > .gitignore << EOL
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env
!.env.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Google API credentials
client_secret*
token.json
credentials.json
scripts/token.json
scripts/credentials.json
EOL
  echo -e "${GREEN}Created .gitignore file${NC}"
else
  echo -e "${GREEN}Using existing .gitignore file${NC}"
fi

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
  echo -e "${RED}Error: .env.example file not found${NC}"
  echo "Please create a .env.example file with placeholder values for your environment variables."
  exit 1
fi

# Check if Prisma schema uses PostgreSQL
if ! grep -q "provider = \"postgresql\"" prisma/schema.prisma; then
  echo -e "${YELLOW}Warning: Your Prisma schema doesn't use PostgreSQL${NC}"
  echo "It's recommended to use PostgreSQL for production deployments."
  echo "Would you like to update your schema to use PostgreSQL? (y/n)"
  read answer
  if [ "$answer" == "y" ]; then
    sed -i '' 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
    echo -e "${GREEN}Updated Prisma schema to use PostgreSQL${NC}"
  fi
fi

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}Prisma client generated${NC}"

# Run a build to check for errors
echo -e "${YELLOW}Running build to check for errors...${NC}"
npm run build && echo -e "${GREEN}Build successful${NC}" || echo -e "${RED}Build failed${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}Vercel CLI not found. Would you like to install it? (y/n)${NC}"
  read answer
  if [ "$answer" == "y" ]; then
    npm install -g vercel
    echo -e "${GREEN}Vercel CLI installed${NC}"
  else
    echo -e "${YELLOW}Please install Vercel CLI manually with 'npm install -g vercel'${NC}"
  fi
fi

echo ""
echo -e "${GREEN}Deployment preparation completed${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Make sure your environment variables are set up in Vercel"
echo "2. Connect your GitHub repository to Vercel"
echo "3. Configure the build settings:"
echo "   - Root directory: jobtracker"
echo "   - Build command: npm run build"
echo "   - Install command: npm install"
echo "   - Output directory: .next"
echo "4. Update Google OAuth redirect URIs in Google Cloud Console"
echo "5. Deploy!"
echo ""
echo -e "${YELLOW}To deploy with Vercel CLI:${NC}"
echo "vercel --prod"
echo "" 