import { NextRequest } from 'next/server';
import { verifyToken } from 'app/lib/auth';
import { prisma } from 'app/lib/prisma';
import { apiSuccess, apiError } from 'app/lib/utils/api';

/**
 * GET handler to check Google integration status
 * Returns the connection status and details
 */
export async function GET(request: NextRequest) {
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
    
    // Find Google account
    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: 'google',
      },
    });
    
    if (!googleAccount) {
      return apiSuccess({
        isConnected: false,
      });
    }
    
    // Get the last sync info
    const lastSync = await prisma.syncLog.findFirst({
      where: {
        userId: userId,
        service: 'google',
      },
      orderBy: {
        syncedAt: 'desc',
      },
    });
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    
    return apiSuccess({
      isConnected: true,
      email: user?.email,
      scopes: googleAccount.scope?.split(' '),
      lastSynced: lastSync?.syncedAt,
    });
  } catch (error) {
    console.error('Error getting Google connection status:', error);
    return apiError('Failed to get connection status', 500);
  }
} 