import { NextRequest, NextResponse } from 'next/server';
import prisma from 'app/lib/db';
import { apiResponse } from 'app/lib/utils/api';
import { getAuthenticatedUser } from 'app/lib/utils/auth';

/**
 * GET /api/tags - Retrieve all tags for the authenticated user
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

    // Retrieve all tags for this user
    const tags = await prisma.tag.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        name: 'asc'
      }
    });

    return apiResponse({
      status: 200,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return apiResponse({
      status: 500,
      message: 'Failed to fetch tags'
    });
  }
} 