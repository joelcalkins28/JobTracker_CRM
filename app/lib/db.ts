import { PrismaClient } from '@prisma/client';

// Define global declarations for PrismaClient to avoid multiple instances
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a new PrismaClient instance or use the existing one
export const db = globalThis.prisma || new PrismaClient();

// In development, we want to keep the instance alive between hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

/**
 * Connect to the database
 * @returns Promise that resolves when connected
 */
export async function connectToDatabase() {
  try {
    await db.$connect();
    console.log('Database connected successfully');
    return db;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

/**
 * Disconnect from the database
 * @returns Promise that resolves when disconnected
 */
export async function disconnectFromDatabase() {
  try {
    await db.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Failed to disconnect from database:', error);
    throw error;
  }
} 