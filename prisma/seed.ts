// Seed script for the database
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  console.log('Created user:', user.id);

  // Create a test job application
  const application = await prisma.jobApplication.upsert({
    where: { id: 'test-application-1' },
    update: {},
    create: {
      id: 'test-application-1',
      jobTitle: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      description: 'A great job opportunity',
      status: 'Applied',
      userId: user.id,
    },
  });

  console.log('Created job application:', application.id);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 