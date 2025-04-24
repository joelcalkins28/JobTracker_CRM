import { NextRequest } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { apiSuccess, apiError } from '@/app/lib/utils/api';

/**
 * POST handler to disconnect Google account
 * Removes the Google account association from the user
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user from token
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return apiError('Unauthorized', 401);
    }
    
    const decodedToken = verifyToken(token);
    
    if (!decodedToken || !decodedToken.id) {
      return apiError('Unauthorized', 401);
    }
    
    const userId = decodedToken.id;
    
    // Delete Google account
    await prisma.account.deleteMany({
      where: {
        userId: userId,
        provider: 'google',
      },
    });
    
    return apiSuccess({
      message: 'Google account disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Google account:', error);
    return apiError('Failed to disconnect Google account', 500);
  }
} 