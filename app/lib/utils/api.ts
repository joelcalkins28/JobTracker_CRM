import { NextResponse } from 'next/server';

/**
 * Standard API success response
 * @param data - The data to return
 * @param status - HTTP status code (default: 200)
 * @returns A NextResponse with standardized format
 */
export function apiSuccess(data: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Standard API error response
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @returns A NextResponse with standardized format
 */
export function apiError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * Handle API exceptions gracefully
 * @param error - The caught error
 * @returns A NextResponse with appropriate error message
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return apiError(error.message);
  }
  
  return apiError('An unexpected error occurred');
} 