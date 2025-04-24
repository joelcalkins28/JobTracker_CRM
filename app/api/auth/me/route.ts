import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { apiSuccess, apiError, handleApiError } from '@/lib/utils/api';

/**
 * GET handler to retrieve the current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookie
    const token = cookies().get('token')?.value;
    
    if (!token) {
      return apiError('Not authenticated', 401);
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      return apiError('Invalid token', 401);
    }
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });
    
    if (!user) {
      return apiError('User not found', 404);
    }
    
    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    
    return apiSuccess(userWithoutPassword);
  } catch (error) {
    return handleApiError(error);
  }
} 