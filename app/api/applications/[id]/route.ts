import { NextRequest } from 'next/server';
import { db } from 'app/lib/db';
import { apiResponse } from 'app/lib/utils/api';
import { getAuthenticatedUser } from 'app/lib/utils/auth';

/**
 * GET /api/applications/[id] - Retrieve a single job application by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return apiResponse({
        status: 401,
        message: 'Unauthorized'
      });
    }

    const { id } = params;

    // Retrieve the application with documents and contacts included
    const application = await db.jobApplication.findUnique({
      where: {
        id,
        userId: user.id // Ensure the application belongs to the user
      },
      include: {
        documents: true,
        contacts: true
      }
    });

    if (!application) {
      return apiResponse({
        status: 404,
        message: 'Application not found'
      });
    }

    return apiResponse({
      status: 200,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return apiResponse({
      status: 500,
      message: 'Failed to fetch application'
    });
  }
}

/**
 * PUT /api/applications/[id] - Update an entire job application
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return apiResponse({
        status: 401,
        message: 'Unauthorized'
      });
    }

    const { id } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.jobTitle || !body.company || !body.status) {
      return apiResponse({
        status: 400,
        message: 'Missing required fields: jobTitle, company, status'
      });
    }

    // Verify the application exists and belongs to the user
    const existingApplication = await db.jobApplication.findUnique({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingApplication) {
      return apiResponse({
        status: 404,
        message: 'Application not found'
      });
    }

    // Extract contact IDs if present
    const contactIds = body.contactIds || [];
    delete body.contactIds;

    // Update the application
    const application = await db.jobApplication.update({
      where: { id },
      data: {
        ...body,
        // Update contacts if provided
        contacts: {
          set: [], // Remove all existing connections
          connect: contactIds.map((contactId: string) => ({ id: contactId }))
        }
      }
    });

    // Retrieve the updated application with documents and contacts included
    const updatedApplication = await db.jobApplication.findUnique({
      where: { id: application.id },
      include: {
        documents: true,
        contacts: true
      }
    });

    return apiResponse({
      status: 200,
      data: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return apiResponse({
      status: 500,
      message: 'Failed to update application'
    });
  }
}

/**
 * PATCH /api/applications/[id] - Partially update a job application
 * Primarily used for status updates
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return apiResponse({
        status: 401,
        message: 'Unauthorized'
      });
    }

    const { id } = params;
    const body = await request.json();

    // Verify the application exists and belongs to the user
    const existingApplication = await db.jobApplication.findUnique({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingApplication) {
      return apiResponse({
        status: 404,
        message: 'Application not found'
      });
    }

    // Update the application with the partial data
    const application = await db.jobApplication.update({
      where: { id },
      data: body
    });

    return apiResponse({
      status: 200,
      data: application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return apiResponse({
      status: 500,
      message: 'Failed to update application status'
    });
  }
}

/**
 * DELETE /api/applications/[id] - Delete a job application
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return apiResponse({
        status: 401,
        message: 'Unauthorized'
      });
    }

    const { id } = params;

    // Verify the application exists and belongs to the user
    const existingApplication = await db.jobApplication.findUnique({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingApplication) {
      return apiResponse({
        status: 404,
        message: 'Application not found'
      });
    }

    // Delete the application
    await db.jobApplication.delete({
      where: { id }
    });

    return apiResponse({
      status: 200,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    return apiResponse({
      status: 500,
      message: 'Failed to delete application'
    });
  }
} 