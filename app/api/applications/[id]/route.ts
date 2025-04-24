import { NextRequest, NextResponse } from 'next/server'; // Uncomment imports
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/utils/api';
import { getAuthenticatedUser } from '@/lib/utils/auth'; // Corrected path

// /**
//  * GET /api/applications/[id] - Retrieve a single job application by ID
//  */
// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     // Verify authentication
//     const user = await getAuthenticatedUser(request);
//     if (!user) {
//       return apiError('Unauthorized', 401);
//     }
// 
//     const { id } = params;
// 
//     // Retrieve the application with documents and contacts included
//     const application = await prisma.jobApplication.findUnique({
//       where: {
//         id,
//         userId: user.id // Ensure the application belongs to the user
//       },
//       include: {
//         documents: true,
//         contacts: true
//       }
//     });
// 
//     if (!application) {
//       return apiError('Application not found', 404);
//     }
// 
//     return apiSuccess(application);
//   } catch (error) {
//     console.error('Error fetching application:', error);
//     return apiError('Failed to fetch application', 500);
//   }
// }

/**
 * PUT /api/applications/[id] - Update an entire job application
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    // const user = await getAuthenticatedUser(request);
    // if (!user) {
    //   return apiError('Unauthorized', 401);
    // }

    const { id } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.jobTitle || !body.company || !body.status) {
      // return apiError('Missing required fields: jobTitle, company, status', 400);
    }

    // Verify the application exists and belongs to the user
    // const existingApplication = await prisma.jobApplication.findUnique({
    //   where: {
    //     id,
    //     userId: user.id
    //   }
    // });

    if (!existingApplication) {
      // return apiError('Application not found', 404);
    }

    // Extract contact IDs if present
    const contactIds = body.contactIds || [];
    delete body.contactIds;

    // Update the application
    const application = await prisma.jobApplication.update({
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
    const updatedApplication = await prisma.jobApplication.findUnique({
      where: { id: application.id },
      include: {
        documents: true,
        contacts: true
      }
    });

    return apiSuccess(updatedApplication);
  } catch (error) {
    console.error('Error updating application:', error);
    return apiError('Failed to update application', 500);
  }
}

/**
 * PATCH /api/applications/[id] - Partially update a job application
 * Primarily used for status updates
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    // const user = await getAuthenticatedUser(request);
    // if (!user) {
    //   return apiError('Unauthorized', 401);
    // }

    const { id } = params;
    const body = await request.json();

    // Verify the application exists and belongs to the user
    // const existingApplication = await prisma.jobApplication.findUnique({
    //   where: {
    //     id,
    //     userId: user.id
    //   }
    // });

    if (!existingApplication) {
      // return apiError('Application not found', 404);
    }

    // Update the application with the partial data
    const application = await prisma.jobApplication.update({
      where: { id },
      data: body
    });

    return apiSuccess(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    return apiError('Failed to update application status', 500);
  }
}

/**
 * DELETE /api/applications/[id] - Delete a job application
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    // const user = await getAuthenticatedUser(request);
    // if (!user) {
    //   return apiError('Unauthorized', 401);
    // }

    const { id } = params;

    // Verify the application exists and belongs to the user
    // const existingApplication = await prisma.jobApplication.findUnique({
    //   where: {
    //     id,
    //     userId: user.id
    //   }
    // });

    if (!existingApplication) {
      // return apiError('Application not found', 404);
    }

    // Delete the application
    await prisma.jobApplication.delete({
      where: { id }
    });

    return apiSuccess({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return apiError('Failed to delete application', 500);
  }
} 