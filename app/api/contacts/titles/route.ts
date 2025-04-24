import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/utils/api';
import { getAuthenticatedUser } from 'app/lib/utils/auth';

/**
 * GET /api/contacts/titles - Retrieve all unique job titles from user's contacts
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    // Fetch distinct non-null positions from the Contact model
    const jobTitles = await prisma.contact.findMany({
      where: {
        userId: user.id,
        position: {
          not: null,
        },
      },
      select: {
        position: true,
      },
      distinct: ['position'],
    });

    // Extract the position strings
    const uniqueTitles = jobTitles
      .map(contact => contact.position)
      .filter((title): title is string => title !== null)
      .sort();

    return apiSuccess(uniqueTitles);
  } catch (error) {
    console.error('Error fetching job titles:', error);
    return apiError('Failed to fetch job titles', 500);
  }
} 