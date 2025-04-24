import { NextRequest } from 'next/server';
import { getAuthUrl } from '@/lib/google';
import { apiSuccess, apiError } from '@/lib/utils/api';

/**
 * GET handler to generate Google OAuth authorization URL
 * Returns the URL for client-side redirect
 */
export async function GET(request: NextRequest) {
  try {
    // Generate the OAuth authorization URL
    const authUrl = getAuthUrl();
    
    // Return the URL to the client
    return apiSuccess({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return apiError('Failed to generate authorization URL', 500);
  }
} 