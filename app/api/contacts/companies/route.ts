import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/utils/api';
import { getAuthenticatedUser } from 'app/lib/utils/auth';

/**
 * GET /api/contacts/companies - Retrieve all unique companies from user's contacts
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    // Find all unique company names from contacts that belong to this user
    const companies = await prisma.contact.findMany({
      where: {
        userId: user.id,
        company: {
          not: null
        }
      },
      select: {
        company: true
      },
      distinct: ['company']
    });

    // Extract company names and filter out any null values
    const companyNames = companies
      .map(c => c.company)
      .filter(Boolean)
      .sort();

    return apiSuccess(companyNames);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return apiError('Failed to fetch companies', 500);
  }
} 