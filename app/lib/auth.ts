import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

type User = {
  id: string;
  email: string;
  name?: string | null;
};

/**
 * Hash a plain text password
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * @param plainPassword - The plain text password
 * @param hashedPassword - The hashed password to compare against
 * @returns Whether the passwords match
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate a JWT token for authentication
 * @param user - The user object to encode in the token
 * @returns The generated JWT token
 */
export function generateToken(user: Partial<User>): string {
  const tokenData = {
    id: user.id,
    email: user.email,
    name: user.name,
  };
  
  const secret = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';
  
  return jwt.sign(tokenData, secret, {
    expiresIn: '7d', // Token expires in 7 days
  });
}

/**
 * Verify a JWT token
 * @param token - The token to verify
 * @returns The decoded token payload or null if invalid
 */
export function verifyToken(token: string): any {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

/**
 * Get the current user from the request cookies
 * @returns The current user ID from the token or null if not authenticated
 */
export async function getCurrentUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return null;
  
  const decodedToken = verifyToken(token);
  return decodedToken?.id || null;
} 