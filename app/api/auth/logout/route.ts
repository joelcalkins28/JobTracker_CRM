import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { apiSuccess } from 'app/lib/utils/api';

/**
 * POST handler for user logout
 * Clears the authentication token cookie
 */
export async function POST(request: NextRequest) {
  // Delete the token cookie
  cookies().delete('token');
  
  return apiSuccess({ message: 'Logged out successfully' });
} 