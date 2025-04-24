import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { apiSuccess, apiError } from "@/lib/utils/api";

/**
 * Initiates the Google OAuth flow by generating and redirecting to an authorization URL
 * Stores a state token in the database to verify the callback is legitimate
 * Initiates the Google OAuth flow by redirecting to Google's authorization page
 * @route GET /api/auth/google
 */
export async function GET(request: NextRequest) {
  try {
    const state = uuidv4();
    const authUrl = getAuthUrl(state);
    const response = NextResponse.redirect(authUrl);

    // Set the state in a cookie on the response
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 5, // 5 minutes
    });

    return response;

  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    // Return the apiError response directly
    return apiError('Failed to generate authorization URL', 500);
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