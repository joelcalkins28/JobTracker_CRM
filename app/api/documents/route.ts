import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/utils/api';
import { getAuthenticatedUser } from '@/lib/utils/auth';

/**
 * POST /api/documents - Upload documents for a job application
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return apiError('Unauthorized', 401);
    }

    const body = await request.json();
    const { applicationId, name, type, fileUrl } = body;

    if (!applicationId || !name || !type) {
      return apiError('Missing required fields: applicationId, name, type', 400);
    }

    // Check if application exists and belongs to user
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application || application.userId !== user.id) {
      return apiError('Application not found or access denied', 404);
    }

    // Create document record (fileUrl is optional or placeholder)
    const document = await prisma.document.create({
      data: {
        name,
        type,
        fileUrl: fileUrl || 'placeholder_url', // Use provided URL or a placeholder
        applicationId: application.id,
      },
    });

    return apiSuccess(document, 201);
  } catch (error) {
    console.error('Error creating document record:', error);
    return apiError('Failed to create document record', 500);
  }
} 