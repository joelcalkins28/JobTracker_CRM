# JobTracker CRM

A Customer Relationship Management (CRM) system designed for job seekers to track applications, manage contacts, and integrate with Google services.

## Features

- User authentication
- Job application tracking
- Contact management
- Document storage
- Email integration with Gmail
- Calendar event management with Google Calendar
- Task management
- Notes and reminders

## Tech Stack

- Next.js 15
- React 19
- Prisma ORM
- SQLite database (configurable for other databases)
- TailwindCSS
- Google API integration

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd jobtracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` file with your own values.

4. Generate Prisma client
```bash
npx prisma generate
```

5. Create and seed the database
```bash
npx prisma db push
npm run seed
```

6. Run development server
```bash
npm run dev
```

7. (Optional) Set up Google API integration
Follow the instructions in the `/docs/GOOGLE_CALENDAR_SETUP.md` file.

## Scripts

- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed the database with sample data
- `npm run test-api` - Test API endpoints
- `npm run test-calendar` - Test calendar integration
- `npm run sync-calendar` - Sync calendar events

## License

MIT
