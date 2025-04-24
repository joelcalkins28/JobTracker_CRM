import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { apiResponse } from '@/app/lib/utils/api';
import { getAuthenticatedUser } from '@/app/lib/utils/auth';
import { DocumentType } from '@/app/lib/types';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/documents - Upload documents for a job application
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
    
    // Parse the multipart form data
    const formData = await request.formData();
    const applicationId = formData.get('applicationId') as string;
    const files = formData.getAll('files') as File[];
    const types = formData.getAll('types') as string[];
    
    // Validate required fields
    if (!applicationId) {
      return apiResponse({
        status: 400,
        message: 'Missing required field: applicationId'
      });
    }
    
    if (files.length === 0) {
      return apiResponse({
        status: 400,
        message: 'No files uploaded'
      });
    }
    
    // Verify the application exists and belongs to the user
    const application = await db.jobApplication.findUnique({
      where: {
        id: applicationId,
        userId: user.id
      }
    });
    
    if (!application) {
      return apiResponse({
        status: 404,
        message: 'Application not found'
      });
    }
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    try {
      await writeFile(join(uploadDir, '.placeholder'), '');
    } catch (error) {
      // Create the directory if it doesn't exist
      const { mkdir } = require('fs/promises');
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Process each file
    const createdDocuments = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = types[i] || DocumentType.OTHER;
      
      // Generate a unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = join(uploadDir, fileName);
      
      // Save the file to disk
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(filePath, buffer);
      
      // Create a document record in the database
      const document = await db.document.create({
        data: {
          name: file.name,
          type: type,
          fileUrl: `/uploads/${fileName}`,
          applicationId: applicationId
        }
      });
      
      createdDocuments.push(document);
    }
    
    return apiResponse({
      status: 201,
      data: createdDocuments,
      message: `${createdDocuments.length} document(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    return apiResponse({
      status: 500,
      message: 'Failed to upload documents'
    });
  }
} 