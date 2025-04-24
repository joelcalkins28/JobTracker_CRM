import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/utils/api";

/**
 * Handles the callback from Google OAuth and processes the authorization code
 * @route GET /api/auth/google/callback
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    
    // Handle authorization errors
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url));
    }
    
    if (!code) {
      return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
    }
    
    // Initialize OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Get user info from Google
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2"
    });
    
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    
    if (!email) {
      return NextResponse.redirect(new URL("/login?error=email_not_found", request.url));
    }
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: userInfo.data.name || email.split("@")[0],
          googleRefreshToken: tokens.refresh_token || "",
          googleAccessToken: tokens.access_token || "",
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000),
        }
      });
    } else {
      // Update existing user with new tokens
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleRefreshToken: tokens.refresh_token || user.googleRefreshToken || "",
          googleAccessToken: tokens.access_token || "",
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000),
        }
      });
    }
    
    // Generate JWT for authentication
    const sessionToken = generateToken({ userId: user.id, email: user.email });
    
    // Set the token in a cookie
    const redirectUrl = new URL('/dashboard', request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return response;
  } catch (error: any) {
    console.error("Google OAuth callback error:", error);
    // Return the response object directly when redirecting on error
    const errorRedirectUrl = new URL('/auth/error?error=OAuthCallbackFailed', request.url);
    return NextResponse.redirect(errorRedirectUrl);
  }
} 