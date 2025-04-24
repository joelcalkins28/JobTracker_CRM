import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { apiResponse } from '@/lib/utils/api';
import { getAuthenticatedUser } from '@/lib/utils/auth';

/**
 * GET /api/contacts/companies - Retrieve all unique companies from user's contacts
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

    return apiResponse({
      status: 200,
      data: companyNames
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return apiResponse({
      status: 500,
      message: 'Failed to fetch companies'
    });
  }
} 