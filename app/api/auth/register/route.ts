import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { apiSuccess, apiError, handleApiError } from '@/lib/utils/api';

/**
 * POST handler for user registration
 * Creates a new user account
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, password } = body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return apiError('Name, email, and password are required', 400);
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return apiError('Email already registered', 409);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    return apiSuccess(userWithoutPassword, 201);
  } catch (error) {
    return handleApiError(error);
  }
} 