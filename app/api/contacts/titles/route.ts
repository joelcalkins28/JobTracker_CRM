import { NextRequest, NextResponse } from 'next/server';
import prisma from 'app/lib/db';
import { apiResponse } from 'app/lib/utils/api';
import { getAuthenticatedUser } from 'app/lib/utils/auth';

/**
 * GET /api/contacts/titles - Retrieve all unique job titles from user's contacts
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return apiResponse({
        status: 401,
        message: 'Unauthorized'
      });
    }

    // Find all unique job titles from contacts that belong to this user
    const titles = await prisma.contact.findMany({
      where: {
        userId: user.id,
        jobTitle: {
          not: null
        }
      },
      select: {
        jobTitle: true
      },
      distinct: ['jobTitle']
    });

    // Extract job titles and filter out any null values
    const jobTitles = titles
      .map(t => t.jobTitle)
      .filter(Boolean)
      .sort();

    return apiResponse({
      status: 200,
      data: jobTitles
    });
  } catch (error) {
    console.error('Error fetching job titles:', error);
    return apiResponse({
      status: 500,
      message: 'Failed to fetch job titles'
    });
  }
} 