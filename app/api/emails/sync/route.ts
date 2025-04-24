import { NextRequest } from 'next/server';
import { verifyToken } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { fetchEmails } from '@/app/lib/gmail';
import { apiSuccess, apiError } from '@/app/lib/utils/api';

/**
 * POST handler to sync emails from Gmail
 * Fetches recent emails and stores them in the database
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
    
    // Get account to check if user has connected Google
    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: userId,
        provider: 'google',
      },
    });
    
    if (!googleAccount) {
      return apiError('Google account not connected', 400);
    }
    
    // Fetch emails from Gmail (last 50 emails)
    const syncResult = await fetchEmails(userId, {
      maxResults: 50,
      labelIds: ['INBOX'],
    });
    
    // Log the sync operation
    await prisma.syncLog.create({
      data: {
        userId: userId,
        service: 'gmail',
        details: `Synced ${syncResult.emails.length} emails`,
        success: true,
      },
    });
    
    return apiSuccess({
      message: 'Emails synced successfully',
      count: syncResult.emails.length,
    });
  } catch (error) {
    console.error('Error syncing emails:', error);
    
    // Log failed sync attempt
    try {
      const userId = request.cookies.get('token')
        ? verifyToken(request.cookies.get('token')?.value || '')?.id
        : null;
        
      if (userId) {
        await prisma.syncLog.create({
          data: {
            userId: userId,
            service: 'gmail',
            details: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            success: false,
          },
        });
      }
    } catch (logError) {
      console.error('Error logging sync failure:', logError);
    }
    
    return apiError('Failed to sync emails', 500);
  }
} 