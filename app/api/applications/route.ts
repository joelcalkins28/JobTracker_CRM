import { NextRequest } from 'next/server';
import prisma from 'app/lib/db';
import { apiResponse } from 'app/lib/utils/api';
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
      return apiResponse({
        status: 401,
        message: 'Unauthorized'
      });
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

    return apiResponse({
      status: 200,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return apiResponse({
      status: 500,
      message: 'Failed to fetch applications'
    });
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
      return apiResponse({
        status: 401,
        message: 'Unauthorized'
      });
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.jobTitle || !body.company || !body.status) {
      return apiResponse({
        status: 400,
        message: 'Missing required fields: jobTitle, company, status'
      });
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

    return apiResponse({
      status: 201,
      data: createdApplication
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return apiResponse({
      status: 500,
      message: 'Failed to create application'
    });
  }
} 