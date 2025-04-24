import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from 'app/lib/prisma';
import { comparePasswords, generateToken } from 'app/lib/auth';
import { apiSuccess, apiError, handleApiError } from 'app/lib/utils/api';

/**
 * POST handler for user login
 * Authenticates a user with email and password
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return apiError('Email and password are required', 400);
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    // Check if user exists
    if (!user) {
      return apiError('Invalid email or password', 401);
    }
    
    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (!isPasswordValid) {
      return apiError('Invalid email or password', 401);
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Set token in cookie
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    return apiSuccess(userWithoutPassword);
  } catch (error) {
    return handleApiError(error);
  }
} 