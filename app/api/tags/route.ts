import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/utils/api';
import { getAuthenticatedUser } from 'app/lib/utils/auth';

/**
 * GET /api/tags - Retrieve all tags for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    // Fetch all distinct tags associated with the user's contacts
    const userContacts = await prisma.contact.findMany({
      where: { userId: user.id },
      select: { tags: { select: { id: true, name: true, color: true, createdAt: true } } }
    });

    // Flatten the tags and make them unique
    const allTags = userContacts.flatMap(contact => contact.tags);
    const uniqueTags = Array.from(new Map(allTags.map(tag => [tag.id, tag])).values());

    // Sort tags alphabetically by name
    uniqueTags.sort((a, b) => a.name.localeCompare(b.name));

    return apiSuccess(uniqueTags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return apiError('Failed to fetch tags', 500);
  }
} 