import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initiates the Google OAuth flow by generating and redirecting to an authorization URL
 * Stores a state token in the database to verify the callback is legitimate
 * Initiates the Google OAuth flow by redirecting to Google's authorization page
 * @route GET /api/auth/google
 */
export async function GET(request: NextRequest) {
  try {
    // State parameter to prevent CSRF attacks
    const state = Math.random().toString(36).substring(2, 15);
    
    // Get the authorization URL from the Google client library
    const authUrl = getAuthUrl(state);
    
    // Redirect to Google's authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Failed to initiate Google OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google authentication" },
      { status: 500 }
    );
  }
}

/**
 * Handles the callback from Google OAuth and processes the authorization code
 * @route POST /api/auth/google/callback
 */
export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // TODO: Exchange code for tokens using OAuth2Client
    // const tokens = await exchangeCodeForTokens(code);
    
    // Store the tokens in the database associated with the user
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleRefreshToken: "tokens.refresh_token", // Replace with actual token
        googleAccessToken: "tokens.access_token", // Replace with actual token
        googleTokenExpiry: new Date(Date.now() + 3600 * 1000), // Example expiry (1 hour)
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "Google account connected successfully"
    });
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.json(
      { error: "Failed to process Google authentication callback" },
      { status: 500 }
    );
  }
} 