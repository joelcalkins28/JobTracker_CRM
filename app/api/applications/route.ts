import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/utils/api';
import { getAuthenticatedUser } from 'app/lib/utils/auth';
import { ApplicationStatus } from 'app/lib/types';

/**
 * GET /api/applications - Retrieve all job applications for the authenticated user
 * Supports filtering by status, company, and search term
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const company = url.searchParams.get('company');
    const search = url.searchParams.get('q');

    // Build the where clause for the query
    const where: any = {
      userId: user.id
    };

    if (status && Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
      where.status = status;
    }

    if (company) {
      where.company = company;
    }

    if (search) {
      where.OR = [
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Retrieve applications with documents included
    const applications = await prisma.jobApplication.findMany({
      where,
      orderBy: {
        dateApplied: 'desc'
      },
      include: {
        documents: true,
        contacts: true
      }
    });

    return apiSuccess(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return apiError('Failed to fetch applications', 500);
  }
}

/**
 * POST /api/applications - Create a new job application
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.jobTitle || !body.company || !body.status) {
      return apiError('Missing required fields: jobTitle, company, status', 400);
    }

    // Extract contact IDs if present
    const contactIds = body.contactIds || [];
    delete body.contactIds;

    // Create the application
    const application = await prisma.jobApplication.create({
      data: {
        ...body,
        userId: user.id,
        // Connect contacts if provided
        contacts: contactIds.length > 0 ? {
          connect: contactIds.map((id: string) => ({ id }))
        } : undefined
      }
    });

    // Retrieve the created application with documents included
    const createdApplication = await prisma.jobApplication.findUnique({
      where: { id: application.id },
      include: {
        documents: true,
        contacts: true
      }
    });

    return apiSuccess(createdApplication, 201);
  } catch (error) {
    console.error('Error creating application:', error);
    return apiError('Failed to create application', 500);
  }
} 