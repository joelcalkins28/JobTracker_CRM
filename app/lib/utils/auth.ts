import { NextRequest } from 'next/server';
import { db } from '@/app/lib/db';
import { SafeUser } from '@/app/lib/types';

/**
 * Get the currently authenticated user from the request
 * @param request - The Next.js request object
 * @returns The authenticated user or null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<SafeUser | null> {
  try {
    // Get the session token from the cookie
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    // Find the session in the database
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });
    
    // If session is not found or expired, return null
    if (!session || new Date(session.expires) < new Date()) {
      return null;
    }
    
    // Return the user without the password field
    const { password, ...safeUser } = session.user;
    return safeUser as SafeUser;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
} 